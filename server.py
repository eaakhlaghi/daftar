#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
دفتر کارها — سرور
فقط کتابخانهٔ استاندارد پایتون. هیچ پکیجی نصب نمی‌شود.

اجرا:   python3 server.py            (پورت ۸۷۰۰)
        python3 server.py 9000       (پورت دلخواه)

کنار این فایل باید index.html و app.css و app.js باشند.
users.json و data.json خودشان ساخته می‌شوند.
"""

import json, os, sys, time, threading, secrets, html, mimetypes, hashlib, hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data.json")
USERS = os.path.join(HERE, "users.json")
SESS = os.path.join(HERE, "sessions.json")
APP = os.path.join(HERE, "index.html")
CSS = os.path.join(HERE, "app.css")
JS = os.path.join(HERE, "app.js")

LOCK = threading.RLock()
BUMP = threading.Condition(LOCK)

PROGS = ["نشده", "در جریان", "منتظر دیگران", "انجام‌شده"]
SIZES = ["خیلی کم", "کم", "متوسط", "زیاد", "خیلی زیاد"]

# فیلدهایی که یک «عضو» روی کار خودش اجازهٔ تغییرشان را دارد
MEMBER_FIELDS = {"pct", "progress", "note", "status", "doneAt"}


# ---------------------------------------------------------------- ذخیره‌سازی

def _load(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _save(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def load_data():
    d = _load(DATA, None)
    if d is None:
        d = {"version": 1, "tasks": {}, "config": {}}
        _save(DATA, d)
    d.setdefault("version", 1)
    d.setdefault("tasks", {})
    d.setdefault("config", {})
    return d


def load_users():
    u = _load(USERS, None)
    if u is None:
        u = {"users": [{"name": "احسان", "role": "owner",
                        "token": secrets.token_urlsafe(18)}]}
        _save(USERS, u)
        sys.stderr.write("\nusers.json ساخته شد. لینک مالک:\n  /?k=%s\n\n"
                         % u["users"][0]["token"])
    return u


def load_sessions():
    s = _load(SESS, None)
    if s is None:
        s = {"sessions": {}}
        _save(SESS, s)
    s.setdefault("sessions", {})
    return s


DB = load_data()
US = load_users()
SS = load_sessions()

# شمارش تلاش ناموفق ورود، به ازای نام و به ازای آی‌پی
FAILS = {}
MAX_FAILS = 8
LOCK_SECONDS = 300


# ---------------------------------------------------------------- رمز و نشست

PBKDF_ROUNDS = 200000


def hash_pw(pw):
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), salt, PBKDF_ROUNDS)
    return "pbkdf2$%d$%s$%s" % (PBKDF_ROUNDS, salt.hex(), dk.hex())


def check_pw(pw, stored):
    try:
        kind, rounds, salt_hex, want = str(stored).split("$")
        if kind != "pbkdf2":
            return False
        dk = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"),
                                 bytes.fromhex(salt_hex), int(rounds))
        return hmac.compare_digest(dk.hex(), want)
    except Exception:
        return False


def has_pw(u):
    return bool(u and u.get("pass"))


def new_session(name):
    sid = secrets.token_urlsafe(24)
    SS["sessions"][sid] = {"name": name, "created": int(time.time())}
    _save(SESS, SS)
    return sid


def session_user(sid):
    if not sid:
        return None
    rec = SS["sessions"].get(sid)
    if not rec:
        return None
    for u in US.get("users", []):
        if u.get("name") == rec.get("name"):
            return u
    return None


def drop_sessions_of(name):
    keep = {}
    for sid, rec in SS["sessions"].items():
        if rec.get("name") != name:
            keep[sid] = rec
    SS["sessions"] = keep
    _save(SESS, SS)


def drop_session(sid):
    if sid and sid in SS["sessions"]:
        del SS["sessions"][sid]
        _save(SESS, SS)


def fail_key(name, ip):
    return "%s|%s" % (name or "?", ip or "?")


def locked_out(name, ip):
    rec = FAILS.get(fail_key(name, ip))
    if not rec:
        return 0
    n, last = rec
    if n < MAX_FAILS:
        return 0
    left = LOCK_SECONDS - (time.time() - last)
    return int(left) if left > 0 else 0


def note_fail(name, ip):
    k = fail_key(name, ip)
    n, last = FAILS.get(k, (0, 0))
    if time.time() - last > LOCK_SECONDS:
        n = 0
    FAILS[k] = (n + 1, time.time())


def clear_fails(name, ip):
    FAILS.pop(fail_key(name, ip), None)


def bump_and_save():
    DB["version"] += 1
    _save(DATA, DB)
    with BUMP:
        BUMP.notify_all()
    return DB["version"]


# ---------------------------------------------------------------- دسترسی

def user_by_token(tok):
    if not tok:
        return None
    for u in US.get("users", []):
        if secrets.compare_digest(str(u.get("token", "")), str(tok)):
            return u
    return None


def acl_of(name):
    roles = (DB["config"].get("access") or {}).get("roles") or {}
    a = roles.get(name) or {}

    def g(v):
        return "all" if v == "all" else (list(v) if isinstance(v, list) else [])
    return {"role": a.get("role") if a.get("role") in ("manager", "member", "viewer") else "member",
            "seeAreas": g(a.get("seeAreas")),
            "seePeople": g(a.get("seePeople")),
            "assignTo": g(a.get("assignTo"))}


def can_see(u, t):
    """آیا این کاربر این کار را می‌بیند؟"""
    if u.get("role") == "owner":
        return True
    name = u.get("name", "")
    if t.get("person", "") == name:
        return True
    a = acl_of(name)
    if a["seeAreas"] == "all":
        return True
    if t.get("area", "") and t.get("area") in a["seeAreas"]:
        return True
    if a["seePeople"] == "all":
        return bool(t.get("person"))
    if t.get("person") and t.get("person") in a["seePeople"]:
        return True
    return False


def can_assign_to(u, person):
    if u.get("role") == "owner":
        return True
    a = acl_of(u.get("name", ""))
    if a["role"] == "viewer":
        return False
    if not person or person == u.get("name"):
        return True
    return a["assignTo"] == "all" or person in a["assignTo"]


def may_write(u, op, path, data):
    """خروجی: (مجاز؟, دادهٔ پالوده‌شده, پیام خطا)"""
    role = u.get("role")
    if role == "owner":
        return True, data, ""

    name = u.get("name", "")
    a = acl_of(name)
    if a["role"] == "viewer":
        return False, None, "دسترسی شما فقط خواندنی است."

    if path.startswith("config/"):
        return False, None, "تنظیمات فقط به دست مالک تغییر می‌کند."

    if not path.startswith("tasks/"):
        return False, None, "مسیر ناشناخته."

    tid = path.split("/", 1)[1]
    cur = DB["tasks"].get(tid)

    if op == "delete":
        return False, None, "حذف کار فقط به دست مالک انجام می‌شود."

    if cur is None:                      # ساختن کار تازه
        person = (data or {}).get("person", "")
        if not can_assign_to(u, person):
            return False, None, "اجازهٔ دادن کار به این شخص را ندارید."
        return True, data, ""

    if not can_see(u, cur):
        return False, None, "این کار در دسترس شما نیست."

    # مدیر حوزه: روی هر کاری که می‌بیند، و می‌تواند شخص را هم عوض کند
    if a["role"] == "manager":
        if "person" in (data or {}) and not can_assign_to(u, data["person"]):
            return False, None, "اجازهٔ دادن کار به این شخص را ندارید."
        return True, data, ""

    # عضو: فقط کار خودش، فقط فیلدهای پیشرفت
    if cur.get("person", "") != name:
        return False, None, "فقط کارهای خودتان را می‌توانید تغییر دهید."
    clean = {k: v for k, v in (data or {}).items() if k in MEMBER_FIELDS}
    if not clean:
        return False, None, "این فیلدها به دست شما تغییر نمی‌کنند."
    return True, clean, ""


def state_for(u):
    tasks = []
    for tid, t in DB["tasks"].items():
        if can_see(u, t):
            d = dict(t)
            d["id"] = tid
            tasks.append(d)
    cfg = dict(DB["config"])
    if u.get("role") != "owner":
        cfg.pop("access", None)        # جدول دسترسی‌ها فقط مال مالک است
    a = acl_of(u.get("name", ""))
    me = {"name": u.get("name", ""), "role": u.get("role", "member"), "acl": a,
          "people": [], "users": []}
    if u.get("role") == "owner":
        me["people"] = [x.get("name", "") for x in US.get("users", [])]
        me["users"] = [{"name": x.get("name", ""), "role": x.get("role", "member"),
                        "token": x.get("token", ""), "haspass": has_pw(x)}
                       for x in US.get("users", [])]
    return {"version": DB["version"], "me": me, "tasks": tasks, "config": cfg}


# ---------------------------------------------------------------- وب

class H(BaseHTTPRequestHandler):
    server_version = "Daftar/1.0"
    protocol_version = "HTTP/1.1"

    def _login_page(self, u, tok, setting, err):
        """صفحهٔ ورود، راست‌به‌چپ و ساده. setting=True یعنی بار اول و رمز باید ساخته شود."""
        name = html.escape(u.get("name", ""))
        t = html.escape(tok or "")
        title = "ساختن رمز" if setting else "ورود"
        intro = ("اولین بار است که وارد می‌شوید. یک رمز برای خودتان بسازید؛ "
                 "از این به بعد با همین رمز وارد می‌شوید."
                 if setting else "رمز خودتان را وارد کنید.")
        second = ('<label>تکرار رمز<input type="password" name="pass2" '
                  'autocomplete="new-password" required minlength="6"></label>'
                  if setting else "")
        errbox = ('<p class="err">%s</p>' % html.escape(err)) if err else ""
        body = """<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>%s — دفتر کارها</title>
<style>
 :root{color-scheme:light dark}
 body{font-family:Vazirmatn,Vazir,system-ui,sans-serif;background:#f4f6f8;color:#16202a;
   margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
 @media (prefers-color-scheme:dark){body{background:#0f1720;color:#e7edf3}
   .card{background:#16202a;border-color:#2a3a4a}
   input{background:#0f1720;color:#e7edf3;border-color:#2a3a4a}}
 .card{background:#fff;border:1px solid #d3dbe2;border-radius:14px;padding:26px 24px;
   width:100%%;max-width:360px;box-shadow:0 8px 28px rgba(0,0,0,.07)}
 h1{font-size:19px;margin:0 0 4px}
 p{font-size:13.5px;color:#5b6b7b;line-height:1.9;margin:0 0 16px}
 label{display:block;font-size:12.5px;color:#5b6b7b;margin-bottom:12px}
 input{display:block;width:100%%;box-sizing:border-box;margin-top:5px;padding:9px 11px;
   font-family:inherit;font-size:15px;border:1px solid #d3dbe2;border-radius:9px}
 button{width:100%%;padding:10px;font-family:inherit;font-size:15px;font-weight:600;
   border:0;border-radius:9px;background:#1d6fa5;color:#fff;cursor:pointer;margin-top:4px}
 .who{font-weight:600;color:#1d6fa5}
 .err{background:#fdecec;border:1px solid #f3b7b7;color:#a32020;border-radius:9px;
   padding:8px 10px;font-size:13px;margin-bottom:14px}
 @media (prefers-color-scheme:dark){.err{background:#3a1c1c;border-color:#6b2b2b;color:#f2b8b8}}
</style></head><body>
<form class="card" method="post" action="api/login">
 <h1>%s</h1>
 <p>خوش آمدید <span class="who">%s</span> — %s</p>
 %s
 <input type="hidden" name="token" value="%s">
 <label>رمز<input type="password" name="pass" autocomplete="%s" required minlength="6" autofocus></label>
 %s
 <button type="submit">%s</button>
</form></body></html>""" % (title, title, name, intro, errbox, t,
                            "new-password" if setting else "current-password",
                            second, title)
        return self._send(200 if not err else 401, body, "text/html; charset=utf-8")

    def _login(self, q, u, how):
        """ورود یا ساختن رمز. ورودی می‌تواند فرم یا JSON باشد."""
        try:
            n = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(n).decode("utf-8") if n else ""
        except Exception:
            raw = ""
        ctype = (self.headers.get("Content-Type") or "").lower()
        data = {}
        if "json" in ctype:
            try:
                data = json.loads(raw or "{}")
            except Exception:
                data = {}
        else:
            for k, v in parse_qs(raw).items():
                data[k] = v[0] if v else ""

        tok = str(data.get("token") or self._tok(q) or "")
        pw = str(data.get("pass") or "")
        pw2 = str(data.get("pass2") or "")
        wants_json = "json" in ctype

        target = u if u else user_by_token(tok)
        if not target:
            if wants_json:
                return self._json(401, {"error": "لینک معتبر نیست."})
            return self._deny()

        name = target.get("name", "")
        ip = self.address_string()
        left = locked_out(name, ip)
        if left:
            msg = "تلاش‌های ناموفق زیاد بود. %d ثانیه دیگر دوباره امتحان کنید." % left
            if wants_json:
                return self._json(429, {"error": msg})
            return self._login_page(target, tok, not has_pw(target), msg)

        with LOCK:
            if not has_pw(target):
                if len(pw) < 6:
                    msg = "رمز باید دست‌کم ۶ نویسه باشد."
                    if wants_json:
                        return self._json(400, {"error": msg})
                    return self._login_page(target, tok, True, msg)
                if pw != pw2:
                    msg = "دو رمز یکسان نیستند."
                    if wants_json:
                        return self._json(400, {"error": msg})
                    return self._login_page(target, tok, True, msg)
                target["pass"] = hash_pw(pw)
                _save(USERS, US)
                bump_and_save()
            else:
                time.sleep(0.4)        # کمی کند کردن حملهٔ حدس رمز
                if not check_pw(pw, target.get("pass")):
                    note_fail(name, ip)
                    msg = "رمز درست نیست."
                    if wants_json:
                        return self._json(401, {"error": msg})
                    return self._login_page(target, tok, False, msg)
            clear_fails(name, ip)
            sid = new_session(name)

        ck = "s=%s; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax" % sid
        if wants_json:
            return self._json(200, {"ok": True}, [("Set-Cookie", ck)])
        return self._send(302, "", "text/html; charset=utf-8",
                          [("Set-Cookie", ck), ("Location", "./")])

    def _users(self, u, body):
        """ساخت یا برداشتن حساب یک شخص — فقط مالک"""
        if u.get("role") != "owner":
            return self._json(403, {"error": "فقط مالک می‌تواند حساب بسازد."})
        op = body.get("op")
        name = str(body.get("name") or "").strip()
        if op not in ("add", "remove", "resetpass") or not name:
            return self._json(400, {"error": "درخواست نامعتبر."})

        with LOCK:
            users = US.setdefault("users", [])
            found = None
            for x in users:
                if x.get("name") == name:
                    found = x
                    break

            if op == "add":
                if found is None:
                    found = {"name": name, "role": "member",
                             "token": secrets.token_urlsafe(18)}
                    users.append(found)
                    _save(USERS, US)
            elif op == "resetpass":
                if found is None:
                    return self._json(404, {"error": "چنین کاربری نیست."})
                found.pop("pass", None)
                _save(USERS, US)
                drop_sessions_of(name)   # نشست‌های بازش بسته می‌شوند
            else:
                if found is not None:
                    if found.get("role") == "owner":
                        return self._json(400, {"error": "حساب مالک برداشته نمی‌شود."})
                    users.remove(found)
                    _save(USERS, US)
                    drop_sessions_of(name)
            bump_and_save()
        return self._json(200, {"ok": True})

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))

    # --- کمکی‌ها
    def _cookie(self, name):
        c = self.headers.get("Cookie") or ""
        for part in c.split(";"):
            part = part.strip()
            if part.startswith(name + "="):
                return part[len(name) + 1:]
        return ""

    def _tok(self, q):
        if "k" in q and q["k"]:
            return q["k"][0]
        return self._cookie("k")

    def _api_ok(self, u, how):
        """آیا این درخواست API مجاز است؟ عضو بی‌رمز باید اول رمز بسازد."""
        if not u:
            return False
        if how == "ok":
            return True
        return False

    def _who(self, q):
        """(کاربر, وضعیت) — وضعیت: ok | need_pass | set_pass | none

        اگر لینک شخصی (?k=) در آدرس باشد و به کاربری غیر از نشستِ فعلی اشاره کند،
        لینک برنده است: نشست قبلی روی همان مرورگر (مثلاً مالک که برای تست وارد شده)
        کنار می‌رود و همان کسی که لینکش باز شده باید وارد شود. این دقیقاً جلوی مشکلی
        را می‌گیرد که «سولماز لینکش را باز می‌کند ولی کارهای مالک را می‌بیند».
        فراخوان‌های API توکن را در آدرس نمی‌فرستند، پس این فقط روی باز شدن خودِ صفحه
        اثر می‌گذارد و کار معمول را به‌هم نمی‌زند."""
        su = session_user(self._cookie("s"))
        url_tok = q["k"][0] if ("k" in q and q["k"]) else ""
        if url_tok:
            tu = user_by_token(url_tok)
            if tu and (not su or tu.get("name") != su.get("name")):
                return (tu, "need_pass") if has_pw(tu) else (tu, "set_pass")
        if su:
            return su, "ok"
        u = user_by_token(self._tok(q))
        if not u:
            return None, "none"
        if has_pw(u):
            return u, "need_pass"       # توکن درست است ولی باید رمز بدهد
        return u, "set_pass"            # هنوز رمزی نساخته: فعلاً راه باز است

    def _send(self, code, body, ctype="application/json; charset=utf-8",
              extra=None):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        for k, v in (extra or {}):
            self.send_header(k, v)
        self.end_headers()
        try:
            self.wfile.write(body)
        except Exception:
            pass

    def _json(self, code, obj, extra=None):
        self._send(code, json.dumps(obj, ensure_ascii=False), extra=extra)

    def _deny(self):
        self._send(403, "<!doctype html><meta charset=utf-8>"
                        "<body style='font-family:sans-serif;direction:rtl;"
                        "text-align:center;padding:60px'>"
                        "<h2>این لینک معتبر نیست</h2>"
                        "<p>لینک شخصی خودتان را باز کنید.</p>",
                   "text/html; charset=utf-8")

    # --- GET
    def do_GET(self):
        p = urlparse(self.path)
        q = parse_qs(p.query)
        tok = self._tok(q)
        u, how = self._who(q)

        if p.path in ("/", "/index.html"):
            if not u:
                return self._deny()
            if how == "need_pass":
                return self._login_page(u, tok, False, "")
            if how == "set_pass":
                # هر کس بار اول باید رمز بسازد — مالک هم. بدون رمز، لینک وارد برنامه نمی‌شود.
                return self._login_page(u, tok, True, "")
            try:
                with open(APP, "rb") as f:
                    body = f.read()
            except Exception:
                return self._send(500, "index.html پیدا نشد.",
                                  "text/plain; charset=utf-8")
            extra = []
            if tok:
                extra.append(("Set-Cookie",
                              "k=%s; Path=/; Max-Age=31536000; SameSite=Lax" % tok))
            return self._send(200, body, "text/html; charset=utf-8", extra)

        if p.path in ("/app.css", "/app.js"):
            # فایل‌های جانبی صفحه — پشت همان احراز هویت صفحهٔ اصلی
            if not self._api_ok(u, how):
                return self._json(401, {"error": "unauthorized"})
            path, ctype = ((CSS, "text/css; charset=utf-8")
                           if p.path == "/app.css"
                           else (JS, "application/javascript; charset=utf-8"))
            try:
                with open(path, "rb") as f:
                    body = f.read()
            except Exception:
                return self._send(500, "%s پیدا نشد." % p.path.lstrip("/"),
                                  "text/plain; charset=utf-8")
            return self._send(200, body, ctype)

        if p.path == "/logout":
            sid = self._cookie("s")
            drop_session(sid)
            return self._send(200,
                "<!doctype html><meta charset=utf-8><body style='font-family:sans-serif;"
                "direction:rtl;text-align:center;padding:60px'><h2>از حساب بیرون آمدید</h2>"
                "<p>برای ورود دوباره، لینک شخصی خودتان را باز کنید.</p>",
                "text/html; charset=utf-8",
                [("Set-Cookie", "s=; Path=/; Max-Age=0; SameSite=Lax")])

        if p.path == "/api/state":
            if not self._api_ok(u, how):
                return self._json(401, {"error": "unauthorized"})
            since = 0
            try:
                since = int(q.get("since", ["0"])[0])
            except Exception:
                since = 0
            if since:
                # انتظار تا تغییر بعدی، حداکثر ۲۵ ثانیه
                end = time.time() + 25
                with BUMP:
                    while DB["version"] <= since and time.time() < end:
                        BUMP.wait(timeout=max(0.2, end - time.time()))
                    if DB["version"] <= since:
                        return self._json(200, {"version": DB["version"],
                                                "unchanged": True})
            with LOCK:
                return self._json(200, state_for(u))

        return self._send(404, "not found", "text/plain; charset=utf-8")

    # --- POST
    def do_POST(self):
        p = urlparse(self.path)
        q = parse_qs(p.query)
        u, how = self._who(q)
        if p.path == "/api/login":
            return self._login(q, u, how)
        if not self._api_ok(u, how):
            return self._json(401, {"error": "unauthorized"})
        if p.path not in ("/api/write", "/api/users"):
            return self._send(404, "not found", "text/plain; charset=utf-8")

        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n > 2 * 1024 * 1024:
                return self._json(413, {"error": "too large"})
            body = json.loads(self.rfile.read(n).decode("utf-8") or "{}")
        except Exception:
            return self._json(400, {"error": "bad json"})

        if p.path == "/api/users":
            return self._users(u, body)

        ops = body.get("ops") or []
        if not isinstance(ops, list) or not ops or len(ops) > 100:
            return self._json(400, {"error": "bad ops"})

        with LOCK:
            staged = []
            for o in ops:
                op = o.get("op")
                path = str(o.get("path") or "")
                data = o.get("data")
                if op not in ("set", "update", "delete"):
                    return self._json(400, {"error": "bad op"})
                if not (path.startswith("tasks/") or path.startswith("config/")):
                    return self._json(400, {"error": "bad path"})
                ok, clean, msg = may_write(u, op, path, data)
                if not ok:
                    return self._json(403, {"error": msg})
                staged.append((op, path, clean))

            for op, path, data in staged:
                kind, key = path.split("/", 1)
                if kind == "config":
                    if op == "delete":
                        DB["config"].pop(key, None)
                    elif op == "set":
                        DB["config"][key] = data
                    else:
                        DB["config"].setdefault(key, {}).update(data or {})
                else:
                    if op == "delete":
                        DB["tasks"].pop(key, None)
                    elif op == "set":
                        DB["tasks"][key] = data or {}
                    else:
                        cur = DB["tasks"].setdefault(key, {})
                        for k, v in (data or {}).items():
                            if isinstance(v, dict) and v.get("__delete__"):
                                cur.pop(k, None)
                            else:
                                cur[k] = v
            v = bump_and_save()
        return self._json(200, {"ok": True, "version": v})


def main():
    port = 8700
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    srv = ThreadingHTTPServer(("0.0.0.0", port), H)
    srv.daemon_threads = True
    sys.stderr.write("دفتر کارها روی پورت %d بالا آمد.\n" % port)
    for u in US.get("users", []):
        sys.stderr.write("  %-12s %-7s %s  →  /?k=%s\n"
                         % (u.get("name", ""), u.get("role", ""),
                            "رمز دارد" if has_pw(u) else "بی‌رمز", u.get("token", "")))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
