(function(){
  "use strict";

  /* ============ تقویم شمسی (الگوریتم jalaali، با تقسیم بُرشی) ============ */
  function div(a,b){ return ~~(a/b); }
  function mod(a,b){ return a - ~~(a/b)*b; }
  function g2d(gy,gm,gd){
    var d = div((gy + div(gm-8,6) + 100100)*1461,4) + div(153*mod(gm+9,12)+2,5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm-8,6),100)*3,4) + 752;
    return d;
  }
  function d2g(jdn){
    var j = 4*jdn + 139361631;
    j = j + div(div(4*jdn + 183187720,146097)*3,4)*4 - 3908;
    var i = div(mod(j,1461),4)*5 + 308;
    var gd = div(mod(i,153),5) + 1;
    var gm = mod(div(i,153),12) + 1;
    var gy = div(j,1461) - 100100 + div(8-gm,6);
    return {gy:gy, gm:gm, gd:gd};
  }
  function jalCal(jy){
    var breaks=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
    var bl=breaks.length, gy=jy+621, leapJ=-14, jp=breaks[0], jm, jump, leap, leapG, march, n, i;
    if(jy < jp || jy >= breaks[bl-1]) return null;
    for(i=1;i<bl;i+=1){
      jm = breaks[i]; jump = jm - jp;
      if(jy < jm) break;
      leapJ = leapJ + div(jump,33)*8 + div(mod(jump,33),4);
      jp = jm;
    }
    n = jy - jp;
    leapJ = leapJ + div(n,33)*8 + div(mod(n,33)+3,4);
    if(mod(jump,33) === 4 && jump - n === 4) leapJ += 1;
    leapG = div(gy,4) - div((div(gy,100)+1)*3,4) - 150;
    march = 20 + leapJ - leapG;
    if(jump - n < 6) n = n - jump + div(jump+4,33)*33;
    leap = mod(mod(n+1,33)-1,4);
    if(leap === -1) leap = 4;
    return {leap:leap, gy:gy, march:march};
  }
  function j2d(jy,jm,jd){
    var r = jalCal(jy);
    if(!r) return null;
    return g2d(r.gy,3,r.march) + (jm-1)*31 - div(jm,7)*(jm-7) + jd - 1;
  }
  function d2j(jdn){
    var gy = d2g(jdn).gy, jy = gy - 621, r = jalCal(jy);
    if(!r) return null;
    var jdn1f = g2d(gy,3,r.march), jd, jm, k;
    k = jdn - jdn1f;
    if(k >= 0){
      if(k <= 185) return {jy:jy, jm:1+div(k,31), jd:mod(k,31)+1};
      k -= 186;
    } else {
      jy -= 1; k += 179;
      if(r.leap === 1) k += 1;
    }
    jm = 7 + div(k,30); jd = mod(k,30) + 1;
    return {jy:jy, jm:jm, jd:jd};
  }
  function jIsLeap(jy){ var r = jalCal(jy); return r ? r.leap === 0 : false; }
  function jMonthLen(jy,jm){
    if(jm <= 6) return 31;
    if(jm <= 11) return 30;
    return jIsLeap(jy) ? 30 : 29;
  }
  var J_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];

  function pad2(n){ return String(n).padStart(2,"0"); }
  function isoOf(gy,gm,gd){ return gy + "-" + pad2(gm) + "-" + pad2(gd); }
  function isoToJ(iso){
    if(!iso) return null;
    var p = String(iso).split("-");
    if(p.length !== 3) return null;
    var gy = parseInt(p[0],10), gm = parseInt(p[1],10), gd = parseInt(p[2],10);
    if(isNaN(gy)||isNaN(gm)||isNaN(gd)) return null;
    return d2j(g2d(gy,gm,gd));
  }
  function jToIso(jy,jm,jd){
    var dn = j2d(jy,jm,jd);
    if(dn === null) return "";
    var g = d2g(dn);
    return isoOf(g.gy,g.gm,g.gd);
  }
  function toFa(s){ return String(s).replace(/[0-9]/g, function(d){ return "۰۱۲۳۴۵۶۷۸۹"[+d]; }); }
  function toLatinDigits(s){
    return String(s)
      .replace(/[۰-۹]/g, function(d){ return String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)); })
      .replace(/[٠-٩]/g, function(d){ return String("٠١٢٣٤٥٦٧٨٩".indexOf(d)); });
  }
  function fmtDate(iso){
    var j = isoToJ(iso);
    if(!j) return iso || "";
    return toFa(j.jd) + " " + J_MONTHS[j.jm-1] + " " + toFa(j.jy);
  }
  function fmtShort(iso){
    var j = isoToJ(iso);
    if(!j) return iso || "";
    return toFa(j.jy + "/" + pad2(j.jm) + "/" + pad2(j.jd));
  }
  function todayISO(){
    var n = new Date();
    return isoOf(n.getFullYear(), n.getMonth()+1, n.getDate());
  }
  function shiftDays(iso, n){
    var p = String(iso).split("-");
    var g = d2g(g2d(parseInt(p[0],10), parseInt(p[1],10), parseInt(p[2],10)) + n);
    return isoOf(g.gy,g.gm,g.gd);
  }
  function daysLeft(iso){
    if(!iso) return null;
    var p = String(iso).split("-");
    if(p.length !== 3) return null;
    var a = g2d(parseInt(p[0],10), parseInt(p[1],10), parseInt(p[2],10));
    var t = todayISO().split("-");
    var b = g2d(parseInt(t[0],10), parseInt(t[1],10), parseInt(t[2],10));
    return a - b;
  }
  function addJMonths(iso, months){
    var j = isoToJ(iso);
    if(!j) return "";
    var total = (j.jy*12) + (j.jm-1) + months;
    var ny = div(total,12), nm = mod(total,12) + 1;
    return jToIso(ny, nm, Math.min(j.jd, jMonthLen(ny,nm)));
  }
  function parseJInput(raw){
    var s = toLatinDigits(String(raw||"").trim());
    if(!s) return {iso:"", ok:true};
    var low = s.replace(/\s+/g,"");
    if(low === "امروز") return {iso: todayISO(), ok:true};
    if(low === "فردا") return {iso: shiftDays(todayISO(),1), ok:true};
    if(low === "پس‌فردا" || low === "پسفردا") return {iso: shiftDays(todayISO(),2), ok:true};
    if(low === "دیروز") return {iso: shiftDays(todayISO(),-1), ok:true};
    var parts = s.split(/[\/\-\.\s]+/).filter(function(x){ return x !== ""; });
    var jy, jm, jd, cur = isoToJ(todayISO());
    if(parts.length === 3){ jy = +parts[0]; jm = +parts[1]; jd = +parts[2]; }
    else if(parts.length === 2){ jy = cur ? cur.jy : 1405; jm = +parts[0]; jd = +parts[1]; }
    else return {iso:"", ok:false, why:"تاریخ را مثل ۱۴۰۵/۹/۱ بنویسید."};
    if(isNaN(jy)||isNaN(jm)||isNaN(jd)) return {iso:"", ok:false, why:"تاریخ خوانده نشد."};
    if(jy < 100) jy += 1400;
    if(jm < 1 || jm > 12) return {iso:"", ok:false, why:"ماه باید بین ۱ و ۱۲ باشد."};
    var len = jMonthLen(jy,jm);
    if(jd < 1 || jd > len) return {iso:"", ok:false, why: J_MONTHS[jm-1] + " " + toFa(jy) + " " + toFa(len) + " روز دارد."};
    var iso = jToIso(jy,jm,jd);
    if(!iso) return {iso:"", ok:false, why:"سال خارج از محدوده است."};
    return {iso: iso, ok:true};
  }
  function makeJDate(opts){
    opts = opts || {};
    var wrap = document.createElement("div");
    wrap.className = "jwrap";
    var input = document.createElement("input");
    input.type = "text"; input.autocomplete = "off";
    input.placeholder = opts.placeholder || "۱۴۰۵/۹/۱";
    if(opts.ariaLabel) input.setAttribute("aria-label", opts.ariaLabel);
    var hint = document.createElement("div");
    hint.className = "jhint";
    var quick = document.createElement("div");
    quick.className = "jquick";
    var current = "";
    function setHint(){
      var r = parseJInput(input.value);
      if(!r.ok){
        input.classList.add("bad");
        hint.className = "jhint bad";
        hint.textContent = r.why || "تاریخ نامعتبر";
        current = "";
      } else {
        input.classList.remove("bad");
        hint.className = "jhint";
        current = r.iso;
        if(r.iso){
          var d = daysLeft(r.iso);
          hint.textContent = fmtDate(r.iso) + (d === 0 ? " — امروز" : d > 0 ? " — " + toFa(d) + " روز بعد" : " — " + toFa(Math.abs(d)) + " روز قبل");
        } else hint.textContent = "";
      }
      if(opts.onChange) opts.onChange(current, r.ok);
    }
    input.addEventListener("input", setHint);
    input.addEventListener("blur", function(){
      var r = parseJInput(input.value);
      if(r.ok && r.iso) input.value = fmtShort(r.iso);
      setHint();
    });
    [["امروز",0],["فردا",1],["+۱ هفته",7],["پاک",null]].forEach(function(p){
      var b = document.createElement("button");
      b.type="button"; b.className="ghost mini"; b.textContent=p[0];
      b.addEventListener("click", function(){
        input.value = (p[1] === null) ? "" : fmtShort(shiftDays(todayISO(), p[1]));
        setHint();
      });
      quick.appendChild(b);
    });
    wrap.appendChild(input); wrap.appendChild(hint); wrap.appendChild(quick);
    return {
      el: wrap, input: input,
      get: function(){ return parseJInput(input.value); },
      set: function(iso){ input.value = iso ? fmtShort(iso) : ""; setHint(); },
      clear: function(){ input.value = ""; setHint(); }
    };
  }

  /* ============ داده ============ */

  var PRIOS = ["بالا","متوسط","پایین"];
  var PROGS = ["شروع‌نشده","در حال انجام","منتظر بررسی","تأیید","انجام‌شده"];
  var DONE_STAGE = "انجام‌شده";
  function stageStatus(s){ return s === DONE_STAGE ? "done" : "open"; }
  function normStage(o){
    var s = o.progress;
    var map = {"نشده":"شروع‌نشده","در جریان":"در حال انجام","منتظر دیگران":"منتظر بررسی"};
    if(map[s]) s = map[s];
    if(o.status === "done") s = DONE_STAGE;
    if(PROGS.indexOf(s) < 0) s = "شروع‌نشده";
    return s;
  }

  /* حجم کار: پنج سطح، و هر سطح یک وزن عددی دارد تا «باقی‌مانده» قابل جمع‌زدن باشد */
  var SIZES = [["خیلی کم",1],["کم",2],["متوسط",3],["زیاد",5],["خیلی زیاد",8]];
  var SIZE_NAMES = SIZES.map(function(s){ return s[0]; });
  function sizeW(name){
    for(var i=0;i<SIZES.length;i++){ if(SIZES[i][0] === name) return SIZES[i][1]; }
    return 3;
  }
  function sizeOf(t){ return SIZE_NAMES.indexOf(t.size) >= 0 ? t.size : "متوسط"; }
  function pctOf(t){
    if(t.status === "done") return 100;
    var n = Number(t.pct);
    if(!isFinite(n) || n <= 0) return 0;
    return Math.min(100, Math.round(n/5)*5);
  }
  function taskLoad(t){ return sizeW(sizeOf(t)); }
  function taskLeft(t){
    if(t.status === "done") return 0;
    return taskLoad(t) * (100 - pctOf(t)) / 100;
  }
  function sumLeft(list){
    var s = 0;
    list.forEach(function(t){ s += taskLeft(t); });
    return s;
  }
  function fmtW(n){
    var r = Math.round(n*10)/10;
    return toFa(Math.abs(r - Math.round(r)) < 0.05 ? String(Math.round(r)) : r.toFixed(1));
  }
  var PROG_LABEL = {"شروع‌نشده":"شروع‌نشده","در حال انجام":"در حال انجام","منتظر بررسی":"منتظر بررسی","تأیید":"تأیید","انجام‌شده":"انجام‌شده"};
  var LEADS = [
    {v:"",  l:"بدون یادآور"},
    {v:"0", l:"یادآور: روز مهلت"},
    {v:"1", l:"یادآور: ۱ روز قبل"},
    {v:"3", l:"یادآور: ۳ روز قبل"},
    {v:"7", l:"یادآور: ۱ هفته قبل"}
  ];
  var REPEATS = [
    {v:"",       l:"بدون تکرار"},
    {v:"هفتگی",  l:"تکرار: هفتگی"},
    {v:"ماهانه", l:"تکرار: ماهانه"},
    {v:"فصلی",   l:"تکرار: فصلی"},
    {v:"سالانه", l:"تکرار: سالانه"},
    {v:"دلخواه", l:"تکرار: دلخواه…"}
  ];
  var REPEAT_DAYS = {"هفتگی":7};
  var REPEAT_MONTHS = {"ماهانه":1,"فصلی":3,"سالانه":12};
  var CUSTOM_REPEAT = "دلخواه";
  var RUNITS = [{v:"day", l:"روز"}, {v:"week", l:"هفته"}, {v:"month", l:"ماه"}, {v:"year", l:"سال"}];
  /* هفته از شنبه شروع می‌شود */
  var WDAYS = ["شنبه","یک‌شنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنج‌شنبه","جمعه"];
  var WDAYS_SHORT = ["ش","ی","د","س","چ","پ","ج"];
  var NO_SUB = "بدون زیردسته";

  var DEFAULT_CATS = {areas:[
    {name:"دانشگاه", subs:["پژوهش","تدریس","اجرایی"]},
    {name:"شرکت فتح‌نور میهن", subs:["مدیریت عامل","کارهای مالی","کارهای ساختاری و نظم‌دهی اوتوماسیون","مدیریت پروژه‌های فنی","مدیریت نیروی انسانی"]},
    {name:"خانواده", subs:["مالی مشهد","مالی ساختمان","تعمیرات خانه","شخصی","ورزش"]}
  ]};

  var db = null, downloads = null, writable = true;

  /* ============ هویت و سطح دسترسی ============ */
  var ME = {name:"", role:"member", acl:{role:"member", seeAreas:[], seePeople:[], assignTo:[]}};
  function isOwner(){ return ME.role === "owner"; }
  function canEditAll(){ return isOwner() || (ME.acl && ME.acl.role === "manager"); }
  function canTouch(t){ return canEditAll() || !!(t && t.person && t.person === ME.name); }
  /* کسانی که روی سرور حساب و لینک دارند؛ بقیه فقط یک نام‌اند */
  function userRec(name){
    var us = ME.users || [];
    for(var i = 0; i < us.length; i++){ if(us[i].name === name) return us[i]; }
    return null;
  }
  function hasLogin(name){ return !!userRec(name); }
  function loginURL(name){
    var r = userRec(name);
    if(!r || !r.token) return "";
    return location.origin + location.pathname + "?k=" + encodeURIComponent(r.token);
  }
  /* آدرس سرور برای ساختن لینک شخصی افراد.
     «داخلی» برای همکاران داخل شبکهٔ شرکت، «بیرونی» برای دسترسی از بیرون.
     اگر آی‌پی یا پورت سرور عوض شد، فقط همین دو خط را عوض کنید. */
  var LINK_HOSTS = [
    {label: "داخلی",  base: "http://192.168.1.3:8700"},
    {label: "بیرونی", base: "http://2.187.128.202:8700"}
  ];
  function loginURLon(name, base){
    var r = userRec(name);
    if(!r || !r.token) return "";
    return base + "/?k=" + encodeURIComponent(r.token);
  }
  function hasPass(name){
    var r = userRec(name);
    return !!(r && r.haspass);
  }
  function resetPass(name, btn){
    if(!isOwner()) return;
    confirmable(btn, "مطمئنید؟", function(){
      fetch("api/users", {
        method:"POST", credentials:"same-origin",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({op:"resetpass", name:name})
      }).then(function(r){
        return r.json().then(function(j){
          if(!r.ok) throw new Error(j && j.error ? j.error : "خطا");
          return j;
        }, function(){ throw new Error("پاسخ نامعتبر"); });
      }).then(function(){
        note("رمز " + name + " پاک شد و نشست‌هایش بسته شد؛ بار بعد رمز تازه می‌سازد.");
      }, function(e){
        note("انجام نشد: " + (e && e.message ? e.message : ""), true);
      });
    });
  }

  function setLogin(name, on, el){
    if(!isOwner()) return;
    if(el) el.disabled = true;
    fetch("api/users", {
      method:"POST", credentials:"same-origin",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({op: on ? "add" : "remove", name: name})
    }).then(function(r){
      return r.json().then(function(j){
        if(!r.ok) throw new Error(j && j.error ? j.error : "خطا");
        return j;
      }, function(){ throw new Error("پاسخ نامعتبر"); });
    }).then(function(){
      note(on ? ("حساب " + name + " ساخته شد؛ لینکش را از همین‌جا کپی کنید.")
              : ("حساب " + name + " برداشته شد؛ لینک قبلی‌اش دیگر کار نمی‌کند."));
    }, function(e){
      if(el){ el.disabled = false; el.checked = !on; }
      note("انجام نشد: " + (e && e.message ? e.message : ""), true);
    });
  }
  function applyRole(){
    var own = isOwner();
    ["btn-cats","btn-access"].forEach(function(id){ var b=$(id); if(b) b.hidden = !own; });
    if(!own){ ["catspanel","accesspanel"].forEach(function(id){ var p=$(id); if(p) p.hidden = true; }); }
    var lo = $("x-logout"); if(lo) lo.title = "خروج " + (ME.name || "");
    /* مالک تا رمز نگذاشته، با توکن وارد می‌شود؛ پیشنهاد ساختن رمز را نشانش می‌دهیم */
    var sp = $("x-setpass");
    if(sp) sp.hidden = !(isOwner() && ME.name && !hasPass(ME.name));
    /* بخش‌های راهنما که فقط به یک نقش مربوط‌اند */
    var hp = $("helppanel");
    if(hp){
      hp.querySelectorAll(".owned").forEach(function(e){ e.hidden = !isOwner(); });
      hp.querySelectorAll(".membered").forEach(function(e){ e.hidden = isOwner(); });
    }
    var im = $("x-import"); if(im) im.hidden = !isOwner();
    var az = $("addzone");  if(az) az.hidden = !(isOwner() || (ME.acl && ME.acl.role === "manager"));
    var h1 = document.querySelector("header h1");
    var sb = document.querySelector("header .sub");
    if(h1 && !isOwner()) h1.textContent = ME.name ? ("کارهای " + ME.name) : "کارهای من";
    if(sb && !isOwner()) sb.textContent =
      "کارهایی که به شما سپرده شده. درصد پیشرفت و وضعیت را همین‌جا به‌روز کنید؛ همان لحظه دیده می‌شود.";
  }
  var tasks = [], lastSig = "", cats = DEFAULT_CATS, people = [], acl = {};
  var filter = {status:"open", area:"all", sub:"all", prio:"all", person:"all",
                prog:"all", project:"all", q:"", tab:"all"};
  var editingId = null, draft = null;
  var loadTimer = null, tasksLoaded = false;
  var addDue = null;
  var boardGroup = "sub";   // sub | stage — چیدمان ستون‌های تخته
  var VIEW = "board";
  try {
    var v0 = localStorage.getItem("view");
    if(v0 === "list" || v0 === "rows") VIEW = v0;
  } catch(e){}
  var panelHidden = false;
  try { panelHidden = localStorage.getItem("panel") === "off"; } catch(e){}

  var $ = function(id){ return document.getElementById(id); };
  var statusBox = $("status"), listEl = $("list"), toastBox = $("toast");
  var toastTimer = null;

  function note(text, alert){
    if(toastTimer){ clearTimeout(toastTimer); toastTimer = null; }
    toastBox.innerHTML = "";
    if(!text) return;
    var d = document.createElement("div");
    d.className = "toastmsg" + (alert ? " alert" : "");
    var sp = document.createElement("span");
    sp.textContent = text;
    d.appendChild(sp);
    var x = document.createElement("button");
    x.type = "button"; x.className = "toastx"; x.textContent = "×";
    x.title = "بستن";
    x.addEventListener("click", function(){ note(""); });
    d.appendChild(x);
    toastBox.appendChild(d);
    /* خطاها کمی بیشتر می‌مانند؛ بقیه خودشان محو می‌شوند */
    toastTimer = setTimeout(function(){
      d.classList.add("out");
      setTimeout(function(){ if(d.parentNode === toastBox) toastBox.innerHTML = ""; }, 350);
    }, alert ? 8000 : 4500);
  }

  /* ============ یادآورها ============ */
  /* هر یادآور: {lead: عدد روز قبل از مهلت یا null، at: تاریخ معین یا ""، time: "HH:MM"} */

  var DEF_TIME = "09:00";

  function okTime(v){
    var m = /^(\d{1,2}):(\d{2})$/.exec(toLatinDigits(String(v || "")).trim());
    if(!m) return "";
    var h = Number(m[1]), mi = Number(m[2]);
    if(h < 0 || h > 23 || mi < 0 || mi > 59) return "";
    return (h < 10 ? "0" : "") + h + ":" + (mi < 10 ? "0" : "") + mi;
  }
  function faTime(v){ return toFa(okTime(v) || DEF_TIME); }
  function nowHM(){
    var d = new Date();
    return (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" +
           (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
  }

  function normRemind(r){
    if(!r || typeof r !== "object") return null;
    var time = okTime(r.time) || DEF_TIME;
    if(r.at) return {lead: null, at: String(r.at), time: time};
    var n = Number(r.lead);
    if(isFinite(n) && n >= 0) return {lead: Math.round(n), at: "", time: time};
    return null;
  }

  /* فهرست یادآورهای یک کار. دادهٔ قدیمی (یک remindLead یا یک remindAt) به یک
     عضو این فهرست تبدیل می‌شود تا چیزی از دست نرود. */
  function remindersOf(t){
    var out = [];
    if(Array.isArray(t.reminders)){
      t.reminders.forEach(function(r){
        var n = normRemind(r);
        if(n) out.push(n);
      });
    }
    if(!out.length){
      if(t.remindAt) out.push({lead: null, at: t.remindAt, time: DEF_TIME});
      else if(t.remindLead !== "" && t.remindLead !== null && t.remindLead !== undefined){
        var n2 = Number(t.remindLead);
        if(isFinite(n2)) out.push({lead: Math.round(n2), at: "", time: DEF_TIME});
      }
    }
    return out;
  }

  /* تاریخ مؤثر یک یادآور؛ خالی اگر به مهلت تکیه دارد و مهلتی نیست */
  function remindIso(t, r){
    if(r.at) return r.at;
    if(!t.due) return "";
    return shiftDays(t.due, -(r.lead || 0));
  }

  /* همهٔ لحظه‌های یادآور، مرتب از نزدیک‌ترین */
  function remindMoments(t){
    var out = [];
    remindersOf(t).forEach(function(r){
      var iso = remindIso(t, r);
      if(iso) out.push({iso: iso, time: r.time, r: r});
    });
    out.sort(function(a, b){
      return a.iso === b.iso ? a.time.localeCompare(b.time) : a.iso.localeCompare(b.iso);
    });
    return out;
  }
  function momentPassed(m){
    var d = daysLeft(m.iso);
    if(d === null) return false;
    if(d < 0) return true;
    if(d > 0) return false;
    return m.time <= nowHM();
  }
  /* نزدیک‌ترین یادآور نرسیده؛ اگر همه رسیده‌اند، آخرینِ رسیده */
  function nextMoment(t){
    var ms = remindMoments(t);
    if(!ms.length) return null;
    for(var i = 0; i < ms.length; i++){ if(!momentPassed(ms[i])) return ms[i]; }
    return ms[ms.length - 1];
  }
  function dueMoment(t){
    if(t.status === "done") return null;
    var ms = remindMoments(t), last = null;
    ms.forEach(function(m){ if(momentPassed(m)) last = m; });
    return last;
  }

  /* سازگاری با کد قدیمی: یک تاریخ یادآور برای نمایش */
  function remindDate(t){
    var m = nextMoment(t);
    return m ? m.iso : "";
  }
  function remindDue(t){ return !!dueMoment(t); }

  /* فیلدهای قدیمی را با یادآور اول همگام نگه می‌داریم تا خروجی و کد قدیمی نشکند */
  /* متن خوانا از همهٔ یادآورها، برای خروجی */
  function remindText(t){
    var ms = remindMoments(t);
    if(!ms.length) return "";
    return ms.map(function(m){
      return fmtShort(m.iso) + " " + faTime(m.time);
    }).join(" ؛ ");
  }

  function remindPatch(list){
    var clean = [];
    (list || []).forEach(function(r){
      var n = normRemind(r);
      if(n) clean.push(n);
    });
    var p = {reminders: clean};
    if(!clean.length){ p.remindLead = ""; p.remindAt = ""; }
    else if(clean[0].at){ p.remindAt = clean[0].at; p.remindLead = ""; }
    else { p.remindAt = ""; p.remindLead = String(clean[0].lead); }
    return p;
  }
  function jdnOf(iso){
    var p = String(iso).split("-");
    return g2d(parseInt(p[0],10), parseInt(p[1],10), parseInt(p[2],10));
  }
  function isoOfJdn(n){ var g = d2g(n); return isoOf(g.gy, g.gm, g.gd); }
  /* شمارهٔ روز هفته، با شنبه = ۰ */
  function wdayOf(iso){
    var d = new Date(iso + "T00:00:00Z");
    return (d.getUTCDay() + 1) % 7;
  }
  function repEvery(t){
    var n = parseInt(t.repeatEvery, 10);
    return (isFinite(n) && n >= 1) ? n : 1;
  }
  function repUnit(t){
    return RUNITS.some(function(u){ return u.v === t.repeatUnit; }) ? t.repeatUnit : "week";
  }
  function repDays(t){
    return Array.isArray(t.repeatDays)
      ? t.repeatDays.map(Number).filter(function(d){ return d >= 0 && d <= 6; }).sort()
      : [];
  }

  /* تاریخ تکرار بعدی، بدون در نظر گرفتن قاعدهٔ پایان */
  function rawNextDue(t){
    var base = t.due || todayISO();
    if(t.repeat === CUSTOM_REPEAT){
      var every = repEvery(t), unit = repUnit(t);
      if(unit === "day") return shiftDays(base, every);
      if(unit === "month") return addJMonths(base, every);
      if(unit === "year") return addJMonths(base, 12 * every);
      var days = repDays(t);
      if(!days.length) return shiftDays(base, 7 * every);
      /* شنبهٔ همان هفتهٔ تاریخ پایه، تا فاصلهٔ هفته‌ها درست شمرده شود */
      var bj = jdnOf(base), weekStart = bj - wdayOf(base);
      for(var k = 1; k <= 400; k++){
        var cj = bj + k, iso = isoOfJdn(cj);
        var weeks = Math.floor((cj - wdayOf(iso) - weekStart) / 7);
        if(weeks % every !== 0) continue;
        if(days.indexOf(wdayOf(iso)) >= 0) return iso;
      }
      return "";
    }
    if(REPEAT_DAYS[t.repeat]) return shiftDays(base, REPEAT_DAYS[t.repeat]);
    if(REPEAT_MONTHS[t.repeat]) return addJMonths(base, REPEAT_MONTHS[t.repeat]);
    return "";
  }

  /* قاعدهٔ پایان: بی‌پایان، بعد از N بار، یا تا یک تاریخ */
  function repeatLeftOf(t){
    var n = parseInt(t.repeatLeft, 10);
    return isFinite(n) ? n : null;
  }
  function nextDue(t){
    if(!t.repeat) return "";
    var nd = rawNextDue(t);
    if(!nd) return "";
    if(t.repeatEnd === "until" && t.repeatUntil && nd > t.repeatUntil) return "";
    if(t.repeatEnd === "count"){
      var left = repeatLeftOf(t);
      if(left !== null && left <= 1) return "";
    }
    return nd;
  }
  /* توصیف تکرار به فارسی، برای نمایش */
  function repeatText(t){
    if(!t.repeat) return "";
    if(t.repeat !== CUSTOM_REPEAT) return t.repeat;
    var every = repEvery(t), unit = repUnit(t);
    var ul = (RUNITS.filter(function(u){ return u.v === unit; })[0] || {}).l || "";
    var out = (every === 1 ? "هر " : "هر " + toFa(every) + " ") + ul;
    if(unit === "week"){
      var ds = repDays(t);
      if(ds.length) out += " — " + ds.map(function(d){ return WDAYS[d]; }).join("، ");
    }
    if(t.repeatEnd === "count"){
      var left = repeatLeftOf(t);
      if(left !== null) out += " · " + toFa(Math.max(0, left)) + " بار مانده";
    } else if(t.repeatEnd === "until" && t.repeatUntil){
      out += " · تا " + fmtShort(t.repeatUntil);
    }
    return out;
  }

  function areaNames(){ return (cats.areas||[]).map(function(a){ return a.name; }); }
  function subsOf(name){
    var a = (cats.areas||[]).filter(function(x){ return x.name === name; })[0];
    return a && a.subs ? a.subs.slice() : [];
  }
  function allPeople(){
    var set = {};
    people.forEach(function(p){ if(p) set[p] = 1; });
    tasks.forEach(function(t){ if(t.person) set[t.person] = 1; });
    return Object.keys(set).sort(function(a,b){ return a.localeCompare(b,"fa"); });
  }

  function fillSelect(sel, items, placeholder, keepValue){
    var keep = keepValue !== undefined ? keepValue : sel.value;
    sel.innerHTML = "";
    if(placeholder !== null && placeholder !== undefined){
      var o = document.createElement("option");
      o.value=""; o.textContent=placeholder;
      sel.appendChild(o);
    }
    items.forEach(function(it){
      var o = document.createElement("option");
      o.value=it; o.textContent=it;
      sel.appendChild(o);
    });
    if(items.indexOf(keep) >= 0) sel.value = keep;
  }
  function fillPairs(sel, pairs, keepValue){
    var keep = keepValue !== undefined ? keepValue : sel.value;
    sel.innerHTML = "";
    pairs.forEach(function(p){
      var o = document.createElement("option");
      o.value=p.v; o.textContent=p.l;
      sel.appendChild(o);
    });
    sel.value = keep;
    if(sel.value !== keep) sel.value = pairs.length ? pairs[0].v : "";
  }
  function badge(text, cls){
    var b = document.createElement("span");
    b.className = "badge" + (cls ? " " + cls : "");
    b.textContent = text;
    return b;
  }

  /* رنگ هر دسته از نام خودش ساخته می‌شود، پس دستهٔ تازه هم خودبه‌خود رنگ می‌گیرد */
  function hueOf(s){
    var h = 0, str = String(s || "");
    for(var i=0;i<str.length;i++){ h = (h*31 + str.charCodeAt(i)) % 360; }
    return h;
  }
  function tint(el, name){
    el.style.setProperty("--tint-c", "hsl(" + hueOf(name) + " 70% 50%)");
  }
  var PRIO_CLASS = {"بالا":"prio-high","متوسط":"prio-mid","پایین":"prio-low"};

  /* انتخاب اولویت، همان‌جا کنار نام کار */
  function prioSelect(t){
    var s = document.createElement("select");
    s.className = "prio " + (PRIO_CLASS[t.priority] || "prio-mid");
    s.setAttribute("aria-label","اولویت");
    PRIOS.forEach(function(p){
      var o = document.createElement("option");
      o.value = p; o.textContent = p;
      s.appendChild(o);
    });
    s.value = PRIOS.indexOf(t.priority) >= 0 ? t.priority : "متوسط";
    s.disabled = !writable || !canEditAll();
    s.addEventListener("change", function(){ setPriority(t, s.value, s); });
    s.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
    return s;
  }

  /* ============ حجم و درصد، همان‌جا روی خود کار ============ */

  function updateTask(t, patch, el){
    if(!guard()) return;
    if(el) el.disabled = true;
    db.doc("tasks/" + t.id).update(patch).then(function(){
      if(el) el.disabled = false;
      note("");
    }, function(e){
      if(el) el.disabled = false;
      renderList();
      onWriteError(e);
    });
  }

  function sizeSelect(t){
    var s = document.createElement("select");
    s.className = "prog";
    s.setAttribute("aria-label","حجم کار");
    s.title = "حجم کار";
    SIZES.forEach(function(p){
      var o = document.createElement("option");
      o.value = p[0];
      o.textContent = "حجم " + p[0];
      s.appendChild(o);
    });
    s.value = sizeOf(t);
    s.disabled = !writable || !canEditAll();
    s.addEventListener("change", function(){ updateTask(t, {size: s.value}, s); });
    s.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
    return s;
  }

  function pctSelect(t){
    var cur = pctOf(t);
    var vals = [0,10,20,30,40,50,60,70,80,90,100];
    if(vals.indexOf(cur) < 0){ vals.push(cur); vals.sort(function(a,b){ return a-b; }); }
    var s = document.createElement("select");
    s.className = "prog";
    s.setAttribute("aria-label","درصد پیشرفت");
    s.title = "درصد پیشرفت";
    vals.forEach(function(v){
      var o = document.createElement("option");
      o.value = String(v);
      o.textContent = toFa(v) + "٪";
      s.appendChild(o);
    });
    s.value = String(cur);
    s.disabled = !writable || t.status === "done" || !canTouch(t);
    s.addEventListener("change", function(){
      var v = Number(s.value);
      var patch = {pct: v};
      /* درصد که از صفر رد شد، وضعیت «شروع نشده» دیگر درست نیست */
      if(v > 0 && t.progress === "شروع‌نشده"){ patch.progress = "در حال انجام"; patch.status = "open"; }
      updateTask(t, patch, s);
    });
    s.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
    return s;
  }

  function progSelect(t){
    var s = document.createElement("select");
    s.className = "prog";
    s.setAttribute("aria-label","وضعیت پیشرفت");
    s.title = "وضعیت پیشرفت";
    PROGS.forEach(function(p){
      var o = document.createElement("option");
      o.value = p; o.textContent = PROG_LABEL[p];
      s.appendChild(o);
    });
    s.value = PROGS.indexOf(t.progress) >= 0 ? t.progress : "شروع‌نشده";
    s.disabled = !writable || !canTouch(t);
    s.addEventListener("change", function(){ setProgress(t, s.value, s); });
    s.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
    return s;
  }

  function pctBar(t){
    var p = pctOf(t);
    var b = document.createElement("span");
    b.className = "bar";
    b.title = toFa(p) + "٪ پیش رفته";
    var i = document.createElement("i");
    i.style.width = p + "%";
    b.appendChild(i);
    return b;
  }

  /* ============ اولویت روزانه ============ */

  /* شمارهٔ اولویت فقط برای امروز معنا دارد؛ شمارهٔ دیروز کهنه است */
  function rankOf(t){
    if(!t.rank) return 0;
    return t.rankDate === todayISO() ? t.rank : 0;
  }
  function rankStale(t){
    return !!t.rank && t.rankDate !== todayISO();
  }
  function rankedToday(){
    return tasks.filter(function(t){ return rankOf(t) > 0 && t.status !== "done"; })
                .sort(function(a,b){ return rankOf(a) - rankOf(b); });
  }
  function setRank(t, n, el){
    var v = parseInt(n, 10);
    if(!isFinite(v) || v <= 0) updateTask(t, {rank: 0, rankDate: ""}, el);
    else updateTask(t, {rank: v, rankDate: todayISO()}, el);
  }
  function clearRanksToday(){
    var mine = tasks.filter(function(t){ return !!t.rank; });
    if(!mine.length){ note("شماره‌ای برای پاک کردن نبود."); return; }
    if(!guard()) return;
    var ops = mine.map(function(t){
      return {op:"update", path:"tasks/" + t.id, data:{rank: 0, rankDate: ""}};
    });
    db.batch(ops).then(function(){
      note("شماره‌های اولویت روزانه پاک شد.");
    }, onWriteError);
  }

  /* شمارهٔ اولویت را در فهرستی که داده می‌شود، از ۱ تا N از نو می‌نویسد */
  function renumberRanks(order){
    if(!guard()) return;
    var today = todayISO(), ops = [];
    order.forEach(function(t, i){
      var want = i + 1;
      if(t.rank === want && t.rankDate === today) return;
      ops.push({op:"update", path:"tasks/" + t.id, data:{rank: want, rankDate: today}});
    });
    if(!ops.length) return;
    db.batch(ops).then(function(){ note(""); }, onWriteError);
  }

  /* کار کشیده‌شده را کنار کار هدف می‌گذارد و همهٔ شماره‌ها را از نو می‌نویسد */
  function reorderRank(dragId, targetId, after){
    if(dragId === targetId) return;
    var drag = tasks.filter(function(t){ return t.id === dragId; })[0];
    var target = tasks.filter(function(t){ return t.id === targetId; })[0];
    if(!drag || !target) return;

    var order = rankedToday().filter(function(t){ return t.id !== dragId; });
    var at = -1;
    for(var i = 0; i < order.length; i++){ if(order[i].id === targetId){ at = i; break; } }
    if(at < 0){
      /* هدف شماره‌دار نیست: کشیده‌شده را ته فهرست بگذار */
      order.push(drag);
    } else {
      order.splice(after ? at + 1 : at, 0, drag);
    }
    renumberRanks(order);
  }

  /* ============ ویرایش درجا ============ */

  var INLINE = null;        /* {host, restore} سلولی که همین حالا باز است */
  var RENDER_HELD = false;  /* رندر تا بسته شدن سلول عقب می‌افتد */

  function inlineClose(){
    if(INLINE && INLINE.restore){
      var f = INLINE.restore;
      INLINE = null;
      f();
    } else INLINE = null;
    if(RENDER_HELD){ RENDER_HELD = false; renderList(); }
  }

  function subsOfArea(areaName){
    var a = (cats.areas || []).filter(function(x){ return x.name === areaName; })[0];
    return a && Array.isArray(a.subs) ? a.subs.slice() : [];
  }

  /* کلیک روی مقدار، آن را به ورودی تبدیل می‌کند. Enter یا خروج از فوکوس ذخیره،
     Escape لغو. opts.kind: text | select | date | textarea */
  function inlineCell(t, field, opts){
    opts = opts || {};
    var host = document.createElement("span");
    host.className = "inl" + (opts.cls ? " " + opts.cls : "");
    var allowed = writable && !opts.readonly
      && (opts.member ? canTouch(t) : canEditAll())
      && !(t.status === "done" && opts.openOnly);

    function valueNow(){
      var v = t[field];
      return (v === undefined || v === null) ? "" : String(v);
    }

    function show(){
      host.innerHTML = "";
      var txt = opts.display ? opts.display(t) : valueNow();
      var v = document.createElement("span");
      v.className = "inl-v" + (txt ? "" : " ph");
      v.textContent = txt || (opts.placeholder || "—");
      if(opts.vcls) v.className += " " + opts.vcls;
      host.appendChild(v);
      if(allowed){
        host.classList.add("can");
        host.title = "برای ویرایش کلیک کنید";
        v.addEventListener("click", function(ev){ ev.stopPropagation(); open(); });
      }
    }

    function commit(raw, keepOpenOnError){
      var patch = null;
      if(opts.kind === "date"){
        var txt = String(raw || "").trim();
        if(!txt) patch = {};
        else {
          var r = parseJInput(txt);
          if(!r.ok){
            if(keepOpenOnError) return false;
            note(r.why || "تاریخ نامعتبر", true);
            inlineClose();
            return false;
          }
          patch = {};
          patch[field] = r.iso;
        }
        if(!Object.keys(patch).length){ patch[field] = ""; }
      } else {
        var val = String(raw === undefined || raw === null ? "" : raw);
        if(opts.trim !== false) val = val.trim();
        if(opts.required && !val){
          note("این مقدار نمی‌تواند خالی باشد.", true);
          inlineClose();
          return false;
        }
        patch = {};
        patch[field] = val;
      }
      if(opts.patch) patch = opts.patch(patch, t);
      var changed = Object.keys(patch).some(function(k){
        return String(patch[k]) !== String(t[k] === undefined ? "" : t[k]);
      });
      INLINE = null;
      if(!changed){ show(); if(RENDER_HELD){ RENDER_HELD = false; renderList(); } return true; }
      updateTask(t, patch);
      return true;
    }

    function open(){
      if(INLINE && INLINE.host === host) return;
      inlineClose();
      INLINE = {host: host, restore: show};
      host.innerHTML = "";
      host.classList.add("editing");

      var el;
      if(opts.kind === "select"){
        el = document.createElement("select");
        var list = (typeof opts.options === "function") ? opts.options(t) : (opts.options || []);
        if(opts.allowEmpty){
          var o0 = document.createElement("option");
          o0.value = ""; o0.textContent = opts.emptyLabel || "—";
          el.appendChild(o0);
        }
        list.forEach(function(v){
          var o = document.createElement("option");
          o.value = v; o.textContent = v;
          el.appendChild(o);
        });
        el.value = valueNow();
        el.addEventListener("change", function(){ commit(el.value); });
      } else if(opts.kind === "textarea"){
        el = document.createElement("textarea");
        el.rows = 3;
        el.value = valueNow();
        el.addEventListener("keydown", function(ev){
          if(ev.key === "Escape"){ ev.preventDefault(); inlineClose(); }
          else if(ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); commit(el.value); }
        });
      } else {
        el = document.createElement("input");
        el.type = "text";
        el.autocomplete = "off";
        if(opts.list) el.setAttribute("list", opts.list);
        el.value = (opts.kind === "date")
          ? (valueNow() ? fmtShort(valueNow()) : "")
          : valueNow();
        if(opts.kind === "date") el.placeholder = "۱۴۰۵/۹/۱";
        el.addEventListener("keydown", function(ev){
          if(ev.key === "Escape"){ ev.preventDefault(); inlineClose(); }
          else if(ev.key === "Enter"){
            ev.preventDefault();
            if(commit(el.value, true) === false){ el.classList.add("bad"); el.focus(); }
          }
        });
      }
      el.className = "inl-in";
      if(opts.inWidth) el.style.width = opts.inWidth;
      el.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
      el.addEventListener("click", function(ev){ ev.stopPropagation(); });
      el.addEventListener("dragstart", function(ev){ ev.preventDefault(); ev.stopPropagation(); });
      el.addEventListener("blur", function(){
        if(!INLINE || INLINE.host !== host) return;
        commit(el.value);
      });
      host.appendChild(el);
      el.focus();
      if(el.select) try { el.select(); } catch(e){}
    }

    show();
    return host;
  }

  /* سلول‌های آماده، تا هر سه نما یک رفتار داشته باشند */
  function cellTitle(t){
    return inlineCell(t, "title", {required:true, cls:"inl-title",
      vcls: PRIO_CLASS[t.priority] || "prio-mid", placeholder:"(بی‌عنوان)"});
  }
  function cellPerson(t){
    return inlineCell(t, "person", {list:"people-list", placeholder:"بدون شخص"});
  }
  function cellProject(t){
    return inlineCell(t, "project", {list:"project-list", placeholder:"بدون پروژه"});
  }
  function cellNote(t){
    return inlineCell(t, "note", {kind:"textarea", member:true, placeholder:"بدون یادداشت"});
  }
  function cellDue(t){
    return inlineCell(t, "due", {kind:"date", placeholder:"بدون مهلت",
      display:function(x){ return x.due ? fmtShort(x.due) : ""; }});
  }
  function cellArea(t){
    return inlineCell(t, "area", {kind:"select", options:areaNames(),
      allowEmpty:true, emptyLabel:"بدون حوزه", placeholder:"بدون حوزه",
      /* حوزه که عوض شود، زیردستهٔ قبلی بی‌معنا می‌شود */
      patch:function(pt){ pt.sub = ""; return pt; }});
  }
  function cellSub(t){
    return inlineCell(t, "sub", {kind:"select",
      options:function(x){ return subsOfArea(x.area); },
      allowEmpty:true, emptyLabel:"بدون زیردسته", placeholder:"بدون زیردسته"});
  }

  var DRAG_ID = "";

  /* عنصر را هم قابل کشیدن می‌کند و هم هدف رها کردن، فقط وقتی چیدمان روی اولویت روزانه است.
     sameGroupOnly برای تخته است: کشیدن بین ستون‌ها باید به دست خود ستون بیفتد. */
  function rankDrag(el, t, sameGroupOnly){
    if(!writable) return;
    /* فقط در چیدمان اولویت روزانه؛ وگرنه سطرها کشیدنی نشوند تا انتخاب متن سخت نشود.
       کارت‌های تخته خودشان draggable را ست می‌کنند، پس جابه‌جایی بین ستون‌ها همیشه هست. */
    if(sortKey !== "rank") return;
    if(!el.draggable){
      el.draggable = true;
      el.addEventListener("dragstart", function(ev){
        DRAG_ID = t.id;
        ev.dataTransfer.setData("text/plain", t.id);
        ev.dataTransfer.effectAllowed = "move";
        el.classList.add("dragging");
      });
      el.addEventListener("dragend", function(){
        DRAG_ID = "";
        el.classList.remove("dragging");
      });
    }

    function sameGroup(){
      if(!sameGroupOnly) return true;
      var d = tasks.filter(function(x){ return x.id === DRAG_ID; })[0];
      if(!d) return false;
      return (d.area || "") === (t.area || "") && (d.sub || "") === (t.sub || "");
    }
    function side(ev){
      var r = el.getBoundingClientRect();
      return (ev.clientY - r.top) > r.height / 2;
    }
    function clear(){ el.classList.remove("drop-before", "drop-after"); }

    el.addEventListener("dragover", function(ev){
      if(!DRAG_ID || DRAG_ID === t.id || !sameGroup()) return;
      ev.preventDefault();
      ev.stopPropagation();
      ev.dataTransfer.dropEffect = "move";
      clear();
      el.classList.add(side(ev) ? "drop-after" : "drop-before");
    });
    el.addEventListener("dragleave", clear);
    el.addEventListener("drop", function(ev){
      var id = DRAG_ID || ev.dataTransfer.getData("text/plain");
      if(!id || id === t.id || !sameGroup()){ clear(); return; }
      ev.preventDefault();
      ev.stopPropagation();
      clear();
      reorderRank(id, t.id, side(ev));
    });
  }

  function rankInput(t){
    var w = document.createElement("span");
    w.className = "rankbox" + (rankStale(t) ? " stale" : "");
    var inp = document.createElement("input");
    inp.type = "number"; inp.min = "0"; inp.step = "1";
    inp.className = "rankin";
    inp.value = rankOf(t) ? String(rankOf(t)) : "";
    inp.placeholder = "—";
    inp.title = rankStale(t)
      ? "شمارهٔ امروز نیست و بی‌اثر است؛ عددی بنویسید تا برای امروز ثبت شود"
      : "اولویت روزانه — عدد بنویسید یا با کشیدن جابه‌جا کنید";
    inp.disabled = !writable || t.status === "done";
    inp.addEventListener("change", function(){ setRank(t, inp.value, inp); });
    inp.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
    inp.addEventListener("dragstart", function(ev){ ev.preventDefault(); ev.stopPropagation(); });
    w.appendChild(inp);
    return w;
  }

  /* ============ شمارهٔ تسک و پروژه ============ */

  function nextNum(){
    var m = 0;
    tasks.forEach(function(t){ if(t.num > m) m = t.num; });
    return m + 1;
  }
  function allProjects(){
    var seen = {}, out = [];
    tasks.forEach(function(t){
      var v = (t.project || "").trim();
      if(v && !seen[v]){ seen[v] = 1; out.push(v); }
    });
    return out.sort(function(a,b){ return a.localeCompare(b,"fa"); });
  }
  /* کارهای قدیمی شماره ندارند؛ یک بار، به ترتیب ثبت، شماره می‌گیرند */
  var numbering = false;
  function backfillNums(){
    if(numbering || !isOwner() || !writable || !db || !db.batch) return;
    var missing = tasks.filter(function(t){ return !t.num; });
    if(!missing.length) return;
    numbering = true;
    missing.sort(function(a,b){
      var c = String(a.createdAt||"").localeCompare(String(b.createdAt||""));
      return c || String(a.id).localeCompare(String(b.id));
    });
    var n = nextNum(), ops = [];
    missing.forEach(function(t){
      ops.push({op:"update", path:"tasks/" + t.id, data:{num: n}});
      n++;
    });
    note("در حال شماره‌گذاری " + toFa(ops.length) + " کار…");
    db.batch(ops).then(function(){
      numbering = false;
      note("");
    }, function(){ numbering = false; });
  }

  /* ============ فیلتر ============ */

  function matchQuery(t){
    if(!filter.q) return true;
    var q = toLatinDigits(filter.q).toLowerCase();
    var hay = [t.title, t.note, t.person, t.area, t.sub, t.project,
               t.num ? ("#" + t.num) : ""].join(" ");
    return toLatinDigits(hay).toLowerCase().indexOf(q) >= 0;
  }
  /* بدون در نظر گرفتن حوزه/زیردسته — برای شمارش روی تب‌ها */
  function passesBase(t){
    if(filter.tab === "mine" && t.person !== ME.name) return false;
    if(filter.tab === "deleg" && (!t.person || t.person === ME.name)) return false;
    if(filter.status === "open" && t.status === "done") return false;
    if(filter.status === "done" && t.status !== "done") return false;
    if(filter.prio !== "all" && t.priority !== filter.prio) return false;
    if(filter.person !== "all" && t.person !== filter.person) return false;
    if(filter.project !== "all" && (t.project || "") !== filter.project) return false;
    if(filter.prog !== "all" && t.progress !== filter.prog) return false;
    return matchQuery(t);
  }
  function visible(t){
    if(!passesBase(t)) return false;
    if(filter.area !== "all" && t.area !== filter.area) return false;
    if(filter.sub !== "all" && (t.sub || NO_SUB) !== filter.sub) return false;
    return true;
  }

  function sortTasks(a,b){
    var pa = PRIOS.indexOf(a.priority), pb = PRIOS.indexOf(b.priority);
    if(pa < 0) pa = 1; if(pb < 0) pb = 1;
    if(pa !== pb) return pa - pb;
    var da = daysLeft(a.due), dbb = daysLeft(b.due);
    if(da === null && dbb !== null) return 1;
    if(dbb === null && da !== null) return -1;
    if(da !== null && dbb !== null && da !== dbb) return da - dbb;
    return String(a.createdAt||"").localeCompare(String(b.createdAt||""));
  }

  /* ============ ترتیب چیدمان ============ */

  var SORTS = [
    ["rank","اولویت روزانه"],
    ["smart","چیدمان هوشمند"],
    ["left","حجم باقی‌مانده"],
    ["load","حجم کل کار"],
    ["prio","اولویت"],
    ["due","نزدیک‌ترین مهلت"],
    ["pct","کم‌ترین پیشرفت"],
    ["person","شخص مربوط"],
    ["project","پروژه"],
    ["num","شمارهٔ تسک"],
    ["area","حوزه"],
    ["sub","زیردسته"],
    ["status","وضعیت"],
    ["title","نام کار"],
    ["created","تازه‌ترین ثبت"]
  ];
  var sortKey = "smart", sortDir = 1;
  try {
    var sv0 = localStorage.getItem("sort");
    if(sv0 && SORTS.some(function(s){ return s[0] === sv0; })) sortKey = sv0;
    if(localStorage.getItem("sortdir") === "-1") sortDir = -1;
  } catch(e){}

  /* هر کلید اول معیار خودش را می‌سنجد و برای مساوی‌ها به چیدمان هوشمند برمی‌گردد */
  function sortNow(a,b){ return sortDir * sortCmp(a,b); }
  function sortCmp(a,b){
    var d;
    if(sortKey === "rank"){
      var ra = rankOf(a), rb = rankOf(b);
      if(ra && rb && ra !== rb) return ra - rb;
      if(ra && !rb) return -1;
      if(rb && !ra) return 1;
    }
    if(sortKey === "left"){ d = taskLeft(b) - taskLeft(a); if(d) return d; }
    else if(sortKey === "load"){ d = taskLoad(b) - taskLoad(a); if(d) return d; }
    else if(sortKey === "pct"){ d = pctOf(a) - pctOf(b); if(d) return d; }
    else if(sortKey === "due"){
      var da = daysLeft(a.due), db2 = daysLeft(b.due);
      if(da === null && db2 !== null) return 1;
      if(db2 === null && da !== null) return -1;
      if(da !== null && db2 !== null && da !== db2) return da - db2;
    }
    else if(sortKey === "person"){
      var pa = a.person || "", pb = b.person || "";
      if(!pa && pb) return 1;
      if(!pb && pa) return -1;
      if(pa !== pb) return pa.localeCompare(pb,"fa");
    }
    else if(sortKey === "num"){
      var na = a.num || 0, nb = b.num || 0;
      if(na !== nb) return na - nb;
    }
    else if(sortKey === "project"){
      var ja = a.project || "", jb = b.project || "";
      if(!ja && jb) return 1;
      if(!jb && ja) return -1;
      if(ja !== jb) return ja.localeCompare(jb,"fa");
    }
    else if(sortKey === "area"){
      /* ترتیب حوزه‌ها همان ترتیب تنظیمات است، نه الفبایی */
      var ordA = areaNames();
      var ia = ordA.indexOf(a.area || ""), ib = ordA.indexOf(b.area || "");
      if(ia < 0) ia = 99;
      if(ib < 0) ib = 99;
      if(ia !== ib) return ia - ib;
      var an = a.area || "", bn = b.area || "";
      if(an !== bn) return an.localeCompare(bn,"fa");
    }
    else if(sortKey === "sub"){
      var sa = a.sub || "", sb = b.sub || "";
      if(!sa && sb) return 1;
      if(!sb && sa) return -1;
      if(sa !== sb) return sa.localeCompare(sb,"fa");
    }
    else if(sortKey === "status"){
      var qa = a.status === "done" ? 1 : 0, qb = b.status === "done" ? 1 : 0;
      if(qa !== qb) return qa - qb;
      var ga = PROGS.indexOf(a.progress), gb = PROGS.indexOf(b.progress);
      if(ga < 0) ga = 0;
      if(gb < 0) gb = 0;
      if(ga !== gb) return ga - gb;
    }
    else if(sortKey === "title"){
      var ta = a.title || "", tb = b.title || "";
      if(ta !== tb) return ta.localeCompare(tb,"fa");
    }
    else if(sortKey === "created"){
      var ca = String(a.createdAt||""), cb2 = String(b.createdAt||"");
      if(ca !== cb2) return cb2.localeCompare(ca);
    }
    return sortTasks(a,b);
  }
  function setSort(v, toggle){
    if(toggle && v === sortKey) sortDir = -sortDir;
    else if(v !== sortKey){ sortKey = v; sortDir = 1; }
    try {
      localStorage.setItem("sort", sortKey);
      localStorage.setItem("sortdir", String(sortDir));
    } catch(e){}
    syncSortUI();
    renderList();
  }
  function flipSort(){
    sortDir = -sortDir;
    try { localStorage.setItem("sortdir", String(sortDir)); } catch(e){}
    syncSortUI();
    renderList();
  }
  function syncSortUI(){
    var sel = $("x-sort");
    if(sel && sel.value !== sortKey) sel.value = sortKey;
    var btn = $("x-sortdir");
    if(btn){
      btn.textContent = sortDir === 1 ? "↓" : "↑";
      btn.title = sortDir === 1
        ? "ترتیب نزولی — برای برعکس کردن بزنید"
        : "ترتیب صعودی — برای برعکس کردن بزنید";
      btn.setAttribute("aria-label", btn.title);
    }
  }

  /* ============ تب‌های حوزه و زیردسته ============ */

  function makeTab(label, count, pressed, onClick){
    var b = document.createElement("button");
    b.type = "button"; b.className = "tab";
    b.setAttribute("role","tab");
    b.setAttribute("aria-pressed", pressed ? "true" : "false");
    b.appendChild(document.createTextNode(label));
    if(count !== null && count !== undefined){
      var c = document.createElement("span");
      c.className = "c"; c.textContent = toFa(count);
      b.appendChild(c);
    }
    b.addEventListener("click", onClick);
    return b;
  }

  function renderTabs(){
    var base = tasks.filter(passesBase);

    /* حوزه‌ها: ترتیب تنظیمات، به‌علاوه حوزه‌های یتیم */
    var order = areaNames();
    var present = {};
    base.forEach(function(t){ present[t.area || "بدون حوزه"] = 1; });
    var names = order.slice();
    Object.keys(present).forEach(function(n){ if(names.indexOf(n) < 0) names.push(n); });

    var strip = $("areatabs");
    strip.innerHTML = "";
    strip.appendChild(makeTab("همه", base.length, filter.area === "all", function(){
      filter.area = "all"; filter.sub = "all"; renderTabs(); renderList();
    }));
    names.forEach(function(n){
      var c = base.filter(function(t){ return (t.area || "بدون حوزه") === n; }).length;
      var tb = makeTab(n, c, filter.area === n, function(){
        filter.area = n; filter.sub = "all"; renderTabs(); renderList();
      });
      tint(tb, n);
      tb.classList.add("tinted");
      strip.appendChild(tb);
    });

    /* زیردسته‌ها: فقط وقتی یک حوزه انتخاب شده */
    var substrip = $("substrip"), subs = $("subtabs");
    subs.innerHTML = "";
    if(filter.area === "all" || VIEW === "board"){
      substrip.hidden = true;
    } else {
      var inArea = base.filter(function(t){ return (t.area || "بدون حوزه") === filter.area; });
      var subOrder = subsOf(filter.area);
      var seen = {};
      inArea.forEach(function(t){ seen[t.sub || NO_SUB] = 1; });
      var subNames = subOrder.slice();
      Object.keys(seen).forEach(function(s){ if(subNames.indexOf(s) < 0) subNames.push(s); });
      if(!subNames.length){
        substrip.hidden = true;
      } else {
        substrip.hidden = false;
        subs.appendChild(makeTab("همه", inArea.length, filter.sub === "all", function(){
          filter.sub = "all"; renderTabs(); renderList();
        }));
        subNames.forEach(function(s){
          var c = inArea.filter(function(t){ return (t.sub || NO_SUB) === s; }).length;
          var tb2 = makeTab(s, c, filter.sub === s, function(){
            filter.sub = s; renderTabs(); renderList();
          });
          tint(tb2, s);
          tb2.classList.add("tinted");
          subs.appendChild(tb2);
        });
      }
    }
    updateArrows();
  }

  function updateArrows(){
    [["areatabs","area-prev","area-next"],["subtabs","sub-prev","sub-next"]].forEach(function(ids){
      var el = $(ids[0]);
      var over = el.scrollWidth > el.clientWidth + 4;
      $(ids[1]).hidden = !over;
      $(ids[2]).hidden = !over;
    });
  }
  function wireArrows(stripId, prevId, nextId){
    $(prevId).addEventListener("click", function(){ $(stripId).scrollBy({left: 180, behavior:"smooth"}); });
    $(nextId).addEventListener("click", function(){ $(stripId).scrollBy({left: -180, behavior:"smooth"}); });
  }

  /* ============ نمایش ============ */

  function renderPickers(){
    fillSelect($("f-area"), areaNames(), null);
    fillSelect($("f-sub"), subsOf($("f-area").value), "— بدون زیردسته —");
    if(!$("f-remind").options.length) fillPairs($("f-remind"), LEADS, "");
    if(!$("f-repeat").options.length) fillPairs($("f-repeat"), REPEATS, "");

    var pf = $("x-person"), keepP = filter.person, ps = allPeople();
    if(pf){
      pf.innerHTML = "";
      var o2 = document.createElement("option"); o2.value="all"; o2.textContent="هر شخصی"; pf.appendChild(o2);
      ps.forEach(function(n){ var o=document.createElement("option"); o.value=n; o.textContent=n; pf.appendChild(o); });
      pf.value = (keepP === "all" || ps.indexOf(keepP) >= 0) ? keepP : "all";
      filter.person = pf.value;
    }

    var dl = $("people-list");
    dl.innerHTML = "";
    ps.forEach(function(n){ var o=document.createElement("option"); o.value=n; dl.appendChild(o); });

    var jf = $("x-project"), keepJ = filter.project, js = allProjects();
    if(jf){
      jf.innerHTML = "";
      var o3 = document.createElement("option"); o3.value="all"; o3.textContent="هر پروژه‌ای"; jf.appendChild(o3);
      js.forEach(function(n){ var o=document.createElement("option"); o.value=n; o.textContent=n; jf.appendChild(o); });
      jf.value = (keepJ === "all" || js.indexOf(keepJ) >= 0) ? keepJ : "all";
      filter.project = jf.value;
    }

    var dl2 = $("project-list");
    dl2.innerHTML = "";
    js.forEach(function(n){ var o=document.createElement("option"); o.value=n; dl2.appendChild(o); });
  }

  function renderCounts(){
    var open = tasks.filter(function(t){ return t.status !== "done"; });
    var over = open.filter(function(t){ var d = daysLeft(t.due); return d !== null && d < 0; });
    var high = open.filter(function(t){ return t.priority === "بالا"; });
    var wait = open.filter(function(t){ return t.progress === "منتظر بررسی"; });
    var rem = open.filter(remindDue);
    var html = "باز <b>" + toFa(open.length) + "</b>";
    if(rem.length) html += " · یادآور <b>" + toFa(rem.length) + "</b>";
    if(high.length) html += " · اولویت بالا <b>" + toFa(high.length) + "</b>";
    if(over.length) html += " · از مهلت گذشته <b>" + toFa(over.length) + "</b>";
    if(wait.length) html += " · منتظر بررسی <b>" + toFa(wait.length) + "</b>";
    html += " · انجام‌شده <b>" + toFa(tasks.length - open.length) + "</b>";
    html += " · حجم ماندهٔ کل <b>" + fmtW(sumLeft(open)) + "</b>";
    $("counts").innerHTML = html;
  }

  function renderReminders(){
    var box = $("reminders");
    box.innerHTML = "";
    var due = tasks.filter(remindDue).sort(sortTasks);
    if(!due.length) return;
    var panel = document.createElement("div");
    panel.className = "remindbox";
    var h = document.createElement("h2");
    h.textContent = "یادآورهای امروز (" + toFa(due.length) + ")";
    panel.appendChild(h);
    var ul = document.createElement("ul");
    due.forEach(function(t){
      var li = document.createElement("li");
      var cb = document.createElement("input");
      cb.type="checkbox"; cb.className="cb";
      cb.setAttribute("aria-label","انجام شد");
      cb.disabled = !writable || !canTouch(t);
      cb.addEventListener("change", function(){ toggleTask(t, cb.checked, cb); });
      li.appendChild(cb);

      var d = document.createElement("div");
      d.style.flex = "1";
      var tt = document.createElement("div");
      tt.textContent = t.title;
      d.appendChild(tt);
      var w = document.createElement("div");
      w.className = "where";
      var bits = [];
      var hit = dueMoment(t);
      if(hit) bits.push("یادآور " + fmtShort(hit.iso) + " ساعت " + faTime(hit.time));
      var nrem = remindersOf(t).length;
      if(nrem > 1) bits.push("از " + toFa(nrem) + " یادآور");
      if(t.area) bits.push(t.area + (t.sub ? " › " + t.sub : ""));
      if(t.due){
        var dl = daysLeft(t.due);
        bits.push(dl === 0 ? "مهلت امروز"
          : dl < 0 ? "مهلت " + fmtDate(t.due) + " — " + toFa(Math.abs(dl)) + " روز گذشته"
          : "مهلت " + fmtDate(t.due) + " — " + toFa(dl) + " روز مانده");
      }
      if(t.person) bits.push(t.person);
      w.textContent = bits.join(" · ");
      d.appendChild(w);
      li.appendChild(d);

      var snooze = document.createElement("button");
      snooze.type="button"; snooze.className="ghost"; snooze.textContent="فردا یادم بیار";
      snooze.disabled = !writable;
      snooze.addEventListener("click", function(){ snoozeTask(t, snooze); });
      li.appendChild(snooze);

      var off = document.createElement("button");
      off.type="button"; off.className="ghost"; off.textContent="بی‌خیال";
      off.title="حذف یادآور این کار";
      off.disabled = !writable;
      off.addEventListener("click", function(){ clearRemind(t, off); });
      li.appendChild(off);
      ul.appendChild(li);
    });
    panel.appendChild(ul);
    box.appendChild(panel);
  }

  function dueBadge(t){
    var d = daysLeft(t.due), cls = "", label = "مهلت " + fmtDate(t.due);
    if(d !== null){
      if(d < 0){ cls="crit"; label = fmtDate(t.due) + " · " + toFa(Math.abs(d)) + " روز گذشته"; }
      else if(d === 0){ cls="warn"; label = "مهلت امروز"; }
      else if(d <= 3){ cls="warn"; label = fmtDate(t.due) + " · " + toFa(d) + " روز مانده"; }
    }
    return badge(label, cls);
  }

  /* یک تکهٔ کوچک با برچسب، که داخلش سلول ویرایش درجا می‌نشیند */
  function labelled(lbl, el, cls){
    var b = document.createElement("span");
    b.className = "badge inlb" + (cls ? " " + cls : "");
    if(lbl){
      var k = document.createElement("i");
      k.className = "inlb-k";
      k.textContent = lbl;
      b.appendChild(k);
    }
    b.appendChild(el);
    return b;
  }
  function dueClass(t){
    var d = daysLeft(t.due);
    if(d === null) return null;
    if(d < 0) return "crit";
    if(d === 0) return "warn";
    if(d <= 3) return "warn";
    return null;
  }

  function taskRow(t){
    if(editingId === t.id) return editRow(t);
    var li = document.createElement("li");
    var cls = [];
    if(t.status === "done") cls.push("done");
    else if(t.priority === "بالا") cls.push("p-high");
    else if(t.priority === "متوسط") cls.push("p-mid");
    li.className = cls.join(" ");
    rankDrag(li, t, false);

    var cb = document.createElement("input");
    cb.type="checkbox"; cb.className="cb";
    cb.checked = t.status === "done";
    cb.setAttribute("aria-label","انجام شد");
    cb.disabled = !writable || !canTouch(t);
    cb.addEventListener("change", function(){ toggleTask(t, cb.checked, cb); });
    li.appendChild(cb);

    var body = document.createElement("div");
    body.className = "body";
    var trow = document.createElement("div");
    trow.className = "titlerow";
    if(t.status !== "done") trow.appendChild(rankInput(t));
    if(t.status !== "done") trow.appendChild(prioSelect(t));
    var nt = numTag(t);
    if(nt) trow.appendChild(nt);
    var title = document.createElement("div");
    title.className = "t " + (PRIO_CLASS[t.priority] || "prio-mid");
    title.appendChild(cellTitle(t));
    trow.appendChild(title);
    body.appendChild(trow);

    var meta = document.createElement("div");
    meta.className = "meta";
    if(t.status === "done"){
      if(t.doneAt) meta.appendChild(badge("انجام‌شده " + fmtDate(t.doneAt), "ok"));
    } else {
      var ps = document.createElement("select");
      ps.className="prog";
      ps.setAttribute("aria-label","پیشرفت");
      PROGS.forEach(function(p){
        var o=document.createElement("option");
        o.value=p; o.textContent=PROG_LABEL[p];
        ps.appendChild(o);
      });
      ps.value = PROGS.indexOf(t.progress) >= 0 ? t.progress : "شروع‌نشده";
      ps.disabled = !writable || !canTouch(t);
      ps.addEventListener("change", function(){ setProgress(t, ps.value, ps); });
      meta.appendChild(ps);
      meta.appendChild(sizeSelect(t));
      meta.appendChild(pctSelect(t));
      meta.appendChild(pctBar(t));
      meta.appendChild(badge("ماندهٔ " + fmtW(taskLeft(t)), taskLeft(t) >= 5 ? "warn" : null));
      meta.appendChild(labelled("پروژه", cellProject(t)));
      meta.appendChild(labelled("مهلت", cellDue(t), t.due ? dueClass(t) : null));
      var r = remindDate(t);
      if(r){
        var nm = nextMoment(t);
        var extra = remindersOf(t).length > 1 ? " +" + toFa(remindersOf(t).length - 1) : "";
        meta.appendChild(remindDue(t)
          ? badge("یادآور رسیده" + extra, "warn")
          : badge("یادآور " + fmtShort(r) + " " + faTime(nm ? nm.time : DEF_TIME) + extra));
      }
    }
    if(t.repeat) meta.appendChild(badge("تکرار " + repeatText(t), "accent"));
    meta.appendChild(labelled("شخص", cellPerson(t)));
    if(filter.area === "all") meta.appendChild(labelled("حوزه", cellArea(t)));
    meta.appendChild(labelled("زیردسته", cellSub(t)));
    if(meta.children.length) body.appendChild(meta);

    if(t.note){
      var n = document.createElement("div");
      n.className="desc"; n.textContent=t.note;
      body.appendChild(n);
    }
    li.appendChild(body);

    if(writable && canTouch(t)){
      var acts = document.createElement("div");
      acts.className="acts";
      var ed = document.createElement("button");
      ed.type="button"; ed.className="ghost"; ed.textContent="ویرایش";
      ed.addEventListener("click", function(){ openEdit(t); });
      acts.appendChild(ed);
      if(isOwner()){
        var del = document.createElement("button");
        del.type="button"; del.className="ghost danger"; del.textContent="حذف";
        del.addEventListener("click", function(){ deleteTask(t, del); });
        acts.appendChild(del);
      }
      li.appendChild(acts);
    }
    return li;
  }

  function field(labelText, el){
    var w = document.createElement("div");
    w.className = "fieldwrap grow";
    var l = document.createElement("label");
    l.className="lbl"; l.textContent=labelText;
    w.appendChild(l); w.appendChild(el);
    return w;
  }

  function editRow(t){
    var li = document.createElement("li");
    li.className = "editing";
    li.appendChild(buildEditForm(t));
    return li;
  }

  function buildEditForm(t){
    var form = document.createElement("form");
    form.className = "editform";

    var title = document.createElement("input");
    title.type="text"; title.value = draft.title;
    title.addEventListener("input", function(){ draft.title = title.value; });

    var area = document.createElement("select");
    fillSelect(area, areaNames(), null, draft.area);
    var sub = document.createElement("select");
    fillSelect(sub, subsOf(draft.area), "— بدون زیردسته —", draft.sub);
    area.addEventListener("change", function(){
      draft.area = area.value; draft.sub = "";
      fillSelect(sub, subsOf(draft.area), "— بدون زیردسته —", "");
    });
    sub.addEventListener("change", function(){ draft.sub = sub.value; });

    var prio = document.createElement("select");
    fillSelect(prio, PRIOS, null, draft.priority);
    prio.addEventListener("change", function(){ draft.priority = prio.value; });

    var person = document.createElement("input");
    person.type="text"; person.value = draft.person; person.setAttribute("list","people-list");
    person.addEventListener("input", function(){ draft.person = person.value; });

    var prog = document.createElement("select");
    fillSelect(prog, PROGS.slice(), null, PROGS.indexOf(draft.progress) >= 0 ? draft.progress : "شروع‌نشده");
    prog.addEventListener("change", function(){ draft.progress = prog.value; });

    /* حجم و درصد پیشرفت، با محاسبهٔ همان‌لحظهٔ حجم باقی‌مانده */
    var szSel = document.createElement("select");
    fillSelect(szSel, SIZE_NAMES.slice(), null, SIZE_NAMES.indexOf(draft.size) >= 0 ? draft.size : "متوسط");
    var pctIn = document.createElement("input");
    pctIn.type = "range"; pctIn.min = "0"; pctIn.max = "100"; pctIn.step = "5";
    pctIn.value = String(pctOf({pct: draft.pct, status: "open"}));
    pctIn.setAttribute("aria-label","درصد پیشرفت");
    var pctLbl = document.createElement("div");
    pctLbl.className = "lbl";
    function showLoad(){
      var p = Number(pctIn.value);
      var w = sizeW(szSel.value);
      pctLbl.textContent = "پیشرفت " + toFa(p) + "٪ — از حجم " + toFa(w)
        + " واحد، ماندهٔ " + fmtW(w * (100 - p) / 100) + " واحد.";
    }
    szSel.addEventListener("change", function(){ draft.size = szSel.value; showLoad(); });
    pctIn.addEventListener("input", function(){
      draft.pct = Number(pctIn.value);
      if(draft.pct > 0 && draft.progress === "شروع‌نشده"){ draft.progress = "در حال انجام"; prog.value = "در حال انجام"; }
      showLoad();
    });
    showLoad();

    var repeat = document.createElement("select");
    fillPairs(repeat, REPEATS, draft.repeat || "");
    var cusBox = document.createElement("div");
    cusBox.className = "cusbox";

    /* ویرایشگر تکرار دلخواه: هر N یکا، روزهای هفته، و قاعدهٔ پایان */
    function renderCustom(){
      if(!cusBox) return;
      cusBox.innerHTML = "";
      if(draft.repeat !== CUSTOM_REPEAT){ cusBox.style.display = "none"; return; }
      cusBox.style.display = "";

      var r1c = document.createElement("div");
      r1c.className = "remrow";
      var lab = document.createElement("span");
      lab.className = "inlb-k"; lab.textContent = "هر";
      r1c.appendChild(lab);
      var ev = document.createElement("input");
      ev.type = "number"; ev.min = "1"; ev.step = "1"; ev.className = "w60";
      ev.value = String(repEvery(draft));
      ev.addEventListener("change", function(){
        var n = parseInt(ev.value, 10);
        draft.repeatEvery = (isFinite(n) && n >= 1) ? n : 1;
        ev.value = String(draft.repeatEvery);
        refreshHint();
      });
      r1c.appendChild(ev);
      var un = document.createElement("select");
      fillPairs(un, RUNITS, repUnit(draft));
      un.addEventListener("change", function(){
        draft.repeatUnit = un.value;
        renderCustom(); refreshHint();
      });
      r1c.appendChild(un);
      cusBox.appendChild(r1c);

      if(repUnit(draft) === "week"){
        var r2c = document.createElement("div");
        r2c.className = "remrow";
        var lb2 = document.createElement("span");
        lb2.className = "inlb-k"; lb2.textContent = "روزهای هفته";
        r2c.appendChild(lb2);
        WDAYS_SHORT.forEach(function(sh, i){
          var on = repDays(draft).indexOf(i) >= 0;
          var l = document.createElement("label");
          l.className = "pk" + (on ? " on" : "");
          l.title = WDAYS[i];
          var cb2 = document.createElement("input");
          cb2.type = "checkbox"; cb2.checked = on;
          cb2.addEventListener("change", function(){
            var cur = repDays(draft);
            if(cb2.checked){ if(cur.indexOf(i) < 0) cur.push(i); }
            else cur = cur.filter(function(x){ return x !== i; });
            draft.repeatDays = cur.sort(function(a,b){ return a-b; });
            renderCustom(); refreshHint();
          });
          l.appendChild(cb2);
          l.appendChild(document.createTextNode(sh));
          r2c.appendChild(l);
        });
        cusBox.appendChild(r2c);
      }

      var r3c = document.createElement("div");
      r3c.className = "remrow";
      var lb3 = document.createElement("span");
      lb3.className = "inlb-k"; lb3.textContent = "پایان";
      r3c.appendChild(lb3);
      var endSel = document.createElement("select");
      fillPairs(endSel, [{v:"never", l:"بی‌پایان"}, {v:"count", l:"بعد از چند بار"},
                         {v:"until", l:"تا تاریخ"}], draft.repeatEnd || "never");
      endSel.addEventListener("change", function(){
        draft.repeatEnd = endSel.value;
        if(endSel.value === "count" && !draft.repeatCount){
          draft.repeatCount = 5; draft.repeatLeft = 5;
        }
        if(endSel.value === "until" && !draft.repeatUntil){
          draft.repeatUntil = addJMonths(draft.due || todayISO(), 3);
        }
        renderCustom(); refreshHint();
      });
      r3c.appendChild(endSel);

      if(draft.repeatEnd === "count"){
        var cnt = document.createElement("input");
        cnt.type = "number"; cnt.min = "1"; cnt.step = "1"; cnt.className = "w60";
        cnt.value = String(draft.repeatCount || 5);
        cnt.setAttribute("aria-label", "تعداد تکرار");
        cnt.addEventListener("change", function(){
          var n = parseInt(cnt.value, 10);
          draft.repeatCount = (isFinite(n) && n >= 1) ? n : 1;
          draft.repeatLeft = draft.repeatCount;
          cnt.value = String(draft.repeatCount);
          refreshHint();
        });
        r3c.appendChild(cnt);
        var cl = document.createElement("span");
        cl.className = "inlb-k"; cl.textContent = "بار";
        r3c.appendChild(cl);
      } else if(draft.repeatEnd === "until"){
        var uj = makeJDate({ariaLabel:"تا تاریخ", onChange:function(iso, ok){
          if(ok){ draft.repeatUntil = iso; refreshHint(); }
        }});
        uj.set(draft.repeatUntil || "");
        r3c.appendChild(uj.el);
      }
      cusBox.appendChild(r3c);
    }

    repeat.addEventListener("change", function(){
      draft.repeat = repeat.value;
      if(draft.repeat === CUSTOM_REPEAT && !draft.repeatUnit) draft.repeatUnit = "week";
      renderCustom(); refreshHint();
    });

    /* همهٔ عناصر پیش از هر فراخوانی set ساخته می‌شوند، چون set باعث صدا زدن refreshHint می‌شود */
    var dueJ = makeJDate({ariaLabel:"مهلت", onChange:function(iso,ok){ if(ok) draft.due = iso; renderRems(); refreshHint(); }});
    var hint = document.createElement("div");
    hint.className = "lbl";
    var remBox = document.createElement("div");
    remBox.className = "rembox";
    dueJ.set(draft.due);

    /* ویرایشگر چند یادآور: هر سطر یک یادآور، با ساعت خودش */
    function renderRems(){
      if(!remBox) return;
      remBox.innerHTML = "";
      if(!draft.reminders.length){
        var e = document.createElement("div");
        e.className = "lbl";
        e.textContent = "یادآوری تنظیم نشده.";
        remBox.appendChild(e);
      }
      draft.reminders.forEach(function(r, i){
        var row = document.createElement("div");
        row.className = "remrow";

        var kind = document.createElement("select");
        fillPairs(kind, [{v:"lead", l:"قبل از مهلت"}, {v:"at", l:"تاریخ معین"}],
                  r.at ? "at" : "lead");
        row.appendChild(kind);

        var mid = document.createElement("span");
        mid.className = "remmid";
        if(r.at){
          var j = makeJDate({ariaLabel:"تاریخ یادآور", onChange:function(iso, ok){
            if(ok){ draft.reminders[i].at = iso; refreshHint(); }
          }});
          j.set(r.at);
          mid.appendChild(j.el);
        } else {
          var dsel = document.createElement("select");
          fillPairs(dsel, [{v:"0", l:"همان روز"}, {v:"1", l:"۱ روز قبل"},
                           {v:"2", l:"۲ روز قبل"}, {v:"3", l:"۳ روز قبل"},
                           {v:"7", l:"۷ روز قبل"}, {v:"14", l:"۱۴ روز قبل"},
                           {v:"30", l:"۳۰ روز قبل"}], String(r.lead || 0));
          dsel.addEventListener("change", function(){
            draft.reminders[i].lead = Number(dsel.value);
            refreshHint();
          });
          mid.appendChild(dsel);
        }
        row.appendChild(mid);

        var tm = document.createElement("input");
        tm.type = "time"; tm.className = "remtime";
        tm.value = okTime(r.time) || DEF_TIME;
        tm.setAttribute("aria-label", "ساعت یادآور");
        tm.addEventListener("change", function(){
          draft.reminders[i].time = okTime(tm.value) || DEF_TIME;
          refreshHint();
        });
        row.appendChild(tm);

        kind.addEventListener("change", function(){
          if(kind.value === "at"){
            draft.reminders[i] = {lead: null, at: draft.due || todayISO(), time: draft.reminders[i].time};
          } else {
            draft.reminders[i] = {lead: 1, at: "", time: draft.reminders[i].time};
          }
          renderRems(); refreshHint();
        });

        var x = document.createElement("button");
        x.type = "button"; x.className = "ghost danger"; x.textContent = "×";
        x.title = "حذف این یادآور";
        x.addEventListener("click", function(){
          draft.reminders.splice(i, 1);
          renderRems(); refreshHint();
        });
        row.appendChild(x);
        remBox.appendChild(row);
      });

      var add = document.createElement("button");
      add.type = "button"; add.className = "mini";
      add.textContent = "+ افزودن یادآور";
      add.addEventListener("click", function(){
        draft.reminders.push(draft.due ? {lead: 1, at: "", time: DEF_TIME}
                                       : {lead: null, at: todayISO(), time: DEF_TIME});
        renderRems(); refreshHint();
      });
      remBox.appendChild(add);
    }

    function refreshHint(){
      if(!hint) return;
      var bits = [];
      var fake = {due: draft.due, reminders: draft.reminders, status: "open"};
      var ms = remindMoments(fake);
      if(ms.length){
        bits.push("یادآور: " + ms.map(function(m){
          return fmtShort(m.iso) + " ساعت " + faTime(m.time);
        }).join("، "));
      }
      var needsDue = draft.reminders.some(function(r){ return !r.at; });
      if(needsDue && !draft.due) bits.push("برای یادآور نسبت به مهلت، مهلت لازم است.");
      if(draft.repeat){
        var nx = nextDue({due: draft.due, repeat: draft.repeat, repeatEvery: draft.repeatEvery,
                          repeatUnit: draft.repeatUnit, repeatDays: draft.repeatDays});
        if(nx) bits.push("با تیک خوردن، نسخه بعدی برای " + fmtDate(nx) + " ساخته می‌شود.");
      }
      hint.textContent = bits.join("  ·  ");
    }
    renderRems();
    renderCustom();

    var r1 = document.createElement("div"); r1.className="row";
    r1.appendChild(field("عنوان کار", title));
    form.appendChild(r1);
    var r2 = document.createElement("div"); r2.className="row";
    r2.appendChild(field("حوزه", area));
    r2.appendChild(field("زیردسته", sub));
    form.appendChild(r2);
    var r3 = document.createElement("div"); r3.className="row";
    var proj = document.createElement("input");
    proj.type = "text"; proj.value = draft.project || "";
    proj.setAttribute("list", "project-list");
    proj.placeholder = "بدون پروژه";
    proj.addEventListener("input", function(){ draft.project = proj.value; });

    r3.appendChild(field("اولویت", prio));
    r3.appendChild(field("شخص مربوط", person));
    r3.appendChild(field("پروژه", proj));
    r3.appendChild(field("مرحله", prog));
    form.appendChild(r3);
    var r3b = document.createElement("div"); r3b.className="row";
    r3b.appendChild(field("حجم کار", szSel));
    r3b.appendChild(field("درصد پیشرفت", pctIn));
    form.appendChild(r3b);
    var r3c = document.createElement("div"); r3c.className="row";
    r3c.appendChild(pctLbl);
    form.appendChild(r3c);
    var r4 = document.createElement("div"); r4.className="row";
    r4.appendChild(field("مهلت (شمسی)", dueJ.el));
    r4.appendChild(field("تکرار", repeat));
    form.appendChild(r4);
    var r4b = document.createElement("div"); r4b.className="row";
    r4b.appendChild(cusBox);
    form.appendChild(r4b);
    var r5 = document.createElement("div"); r5.className="row";
    r5.appendChild(field("یادآورها", remBox));
    form.appendChild(r5);
    var r5b = document.createElement("div"); r5b.className="row";
    r5b.appendChild(hint);
    form.appendChild(r5b);

    var descEl = document.createElement("textarea");
    descEl.value = draft.note;
    descEl.placeholder = "توضیحات، لینک، شماره نسخه، هر چیزی که لازم است یادتان بماند…";
    /* کادر توضیحات خودش با متن بلند می‌شود تا اسکرول تودرتو پیش نیاید */
    function autoGrow(){
      descEl.style.height = "auto";
      descEl.style.height = (descEl.scrollHeight + 2) + "px";
    }
    descEl.addEventListener("input", function(){ draft.note = descEl.value; autoGrow(); });
    setTimeout(autoGrow, 0);
    var r6 = document.createElement("div"); r6.className="row";
    r6.appendChild(field("توضیحات", descEl));
    form.appendChild(r6);

    var r7 = document.createElement("div"); r7.className="row";
    var save = document.createElement("button");
    save.type="submit"; save.className="primary"; save.textContent="ذخیره";
    var cancel = document.createElement("button");
    cancel.type="button"; cancel.textContent="انصراف";
    cancel.addEventListener("click", function(){ editingId=null; draft=null; renderList(); });
    var sp = document.createElement("span"); sp.className="spacer";
    r7.appendChild(save); r7.appendChild(cancel); r7.appendChild(sp);
    form.appendChild(r7);

    form.addEventListener("submit", function(ev){
      ev.preventDefault();
      var dr = dueJ.get();
      if(!dr.ok){ note("مهلت نامعتبر است.", true); return; }
      draft.due = dr.iso;
      saveEdit(t, save);
    });
    refreshHint();
    return form;
  }

  function renderListView(){
    listEl.innerHTML = "";
    var shown = tasks.filter(visible);
    if(editingId && shown.every(function(t){ return t.id !== editingId; })){
      var ed = tasks.filter(function(t){ return t.id === editingId; })[0];
      if(ed) shown = shown.concat([ed]);
    }
    if(!shown.length){
      var e = document.createElement("div");
      e.className = "empty";
      e.textContent = filter.q ? "چیزی با این جستجو پیدا نشد."
        : tasks.length ? "در این دسته کاری نیست." : "هنوز کاری ثبت نشده. دکمه «کار تازه» را بزنید.";
      listEl.appendChild(e);
      return;
    }

    /* با انتخاب یک حوزه، تیتر حوزه لازم نیست؛ گروه‌بندی بر اساس زیردسته */
    if(filter.area !== "all"){
      var bySub = {};
      shown.forEach(function(t){ var k=t.sub||NO_SUB; (bySub[k]=bySub[k]||[]).push(t); });
      var subOrder = subsOf(filter.area);
      Object.keys(bySub).sort(function(a,b){
        var ia=subOrder.indexOf(a), ib=subOrder.indexOf(b);
        if(ia<0) ia=99; if(ib<0) ib=99;
        return ia-ib || a.localeCompare(b,"fa");
      }).forEach(function(sk){
        var sec = document.createElement("section");
        sec.className = "area";
        tint(sec, sk);
        if(filter.sub === "all"){
          var sh = document.createElement("div");
          sh.className="sub-h tinted";
          sh.textContent = sk + " (" + toFa(bySub[sk].length)
            + (sumLeft(bySub[sk]) > 0 ? " — ماندهٔ " + fmtW(sumLeft(bySub[sk])) : "") + ")";
          sec.appendChild(sh);
        }
        var ul = document.createElement("ul");
        ul.className="tasks";
        bySub[sk].sort(sortNow).forEach(function(t){ ul.appendChild(taskRow(t)); });
        sec.appendChild(ul);
        listEl.appendChild(sec);
      });
      return;
    }

    var order = areaNames(), groups = {};
    shown.forEach(function(t){ var k=t.area||"بدون حوزه"; (groups[k]=groups[k]||[]).push(t); });
    Object.keys(groups).sort(function(a,b){
      var ia=order.indexOf(a), ib=order.indexOf(b);
      if(ia<0) ia=99; if(ib<0) ib=99;
      return ia-ib || a.localeCompare(b,"fa");
    }).forEach(function(areaName){
      var sec = document.createElement("section");
      sec.className="area";
      tint(sec, areaName);
      var h = document.createElement("h2");
      h.className="area-h tinted";
      h.appendChild(document.createTextNode(areaName));
      var n = document.createElement("span");
      n.className="n";
      n.textContent = "(" + toFa(groups[areaName].length)
        + (sumLeft(groups[areaName]) > 0 ? " — ماندهٔ " + fmtW(sumLeft(groups[areaName])) : "") + ")";
      h.appendChild(n);
      sec.appendChild(h);
      var ul = document.createElement("ul");
      ul.className="tasks";
      groups[areaName].sort(sortNow).forEach(function(t){ ul.appendChild(taskRow(t)); });
      sec.appendChild(ul);
      listEl.appendChild(sec);
    });
  }

  /* ============ تخته (ترلویی) ============ */

  /* ستون‌ها: در نمای «همه» حوزه‌ها، و داخل یک حوزه زیردسته‌های همان حوزه */
  function boardColumns(shown){
    var cols = [], seen = {}, i;
    if(boardGroup === "stage"){
      PROGS.forEach(function(s){ cols.push({key:s, label:s}); });
      return {byStage:true, cols:cols};
    }
    if(filter.area === "all"){
      var order = areaNames();
      order.forEach(function(n){ cols.push({key:n, label:n}); seen[n]=1; });
      shown.forEach(function(t){
        var k = t.area || "بدون حوزه";
        if(!seen[k]){ seen[k]=1; cols.push({key:k, label:k}); }
      });
      return {byArea:true, cols:cols};
    }
    subsOf(filter.area).forEach(function(s){ cols.push({key:s, label:s}); seen[s]=1; });
    shown.forEach(function(t){
      var k = t.sub || NO_SUB;
      if(!seen[k]){ seen[k]=1; cols.push({key:k, label:k}); }
    });
    if(!cols.length) cols.push({key:NO_SUB, label:NO_SUB});
    return {byArea:false, cols:cols};
  }

  function numTag(t){
    if(!t.num) return null;
    var n = document.createElement("span");
    n.className = "numtag";
    n.textContent = "#" + toFa(t.num);
    n.title = "شمارهٔ تسک";
    return n;
  }
  function cardFor(t){
    if(editingId === t.id){
      var holder = document.createElement("ul");
      holder.className = "tasks";
      holder.appendChild(editRow(t));
      return holder;
    }
    var c = document.createElement("div");
    var cls = ["cardx"];
    if(t.status === "done") cls.push("done");
    else if(t.priority === "بالا") cls.push("p-high");
    else if(t.priority === "متوسط") cls.push("p-mid");
    c.className = cls.join(" ");
    c.setAttribute("data-id", t.id);
    if(writable){
      c.draggable = true;
      c.addEventListener("dragstart", function(ev){
        DRAG_ID = t.id;
        ev.dataTransfer.setData("text/plain", t.id);
        ev.dataTransfer.effectAllowed = "move";
        c.classList.add("dragging");
      });
      c.addEventListener("dragend", function(){
        DRAG_ID = "";
        c.classList.remove("dragging");
      });
      rankDrag(c, t, true);
    }

    var cb = document.createElement("input");
    cb.type="checkbox"; cb.className="cb";
    cb.checked = t.status === "done";
    cb.setAttribute("aria-label","انجام شد");
    cb.disabled = !writable || !canTouch(t);
    cb.addEventListener("change", function(){ toggleTask(t, cb.checked, cb); });
    c.appendChild(cb);

    var body = document.createElement("div");
    body.className = "body";
    var trow = document.createElement("div");
    trow.className = "titlerow";
    if(t.status !== "done") trow.appendChild(rankInput(t));
    if(t.status !== "done") trow.appendChild(prioSelect(t));
    var nt = numTag(t);
    if(nt) trow.appendChild(nt);
    var title = document.createElement("div");
    title.className = "t " + (PRIO_CLASS[t.priority] || "prio-mid");
    title.appendChild(cellTitle(t));
    trow.appendChild(title);
    body.appendChild(trow);

    var meta = document.createElement("div");
    meta.className = "meta";
    if(t.status === "done"){
      if(t.doneAt) meta.appendChild(badge("انجام‌شده " + fmtShort(t.doneAt), "ok"));
    } else {
      var ps = document.createElement("select");
      ps.className="prog";
      ps.setAttribute("aria-label","پیشرفت");
      PROGS.forEach(function(p){
        var o=document.createElement("option");
        o.value=p; o.textContent=PROG_LABEL[p];
        ps.appendChild(o);
      });
      ps.value = PROGS.indexOf(t.progress) >= 0 ? t.progress : "شروع‌نشده";
      ps.disabled = !writable || !canTouch(t);
      ps.addEventListener("change", function(){ setProgress(t, ps.value, ps); });
      ps.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
      meta.appendChild(ps);
      meta.appendChild(sizeSelect(t));
      meta.appendChild(pctSelect(t));
      meta.appendChild(pctBar(t));
      meta.appendChild(badge("ماندهٔ " + fmtW(taskLeft(t)), taskLeft(t) >= 5 ? "warn" : null));
      meta.appendChild(labelled("پروژه", cellProject(t)));
      meta.appendChild(labelled("مهلت", cellDue(t), t.due ? dueClass(t) : null));
      var r = remindDate(t);
      if(r && remindDue(t)) meta.appendChild(badge("یادآور رسیده","warn"));
    }
    if(t.repeat) meta.appendChild(badge("تکرار " + repeatText(t), "accent"));
    meta.appendChild(labelled("شخص", cellPerson(t)));
    if(filter.area === "all") meta.appendChild(labelled("حوزه", cellArea(t)));
    meta.appendChild(labelled("زیردسته", cellSub(t)));
    if(meta.children.length) body.appendChild(meta);

    if(t.note){
      var n = document.createElement("div");
      n.className="desc"; n.textContent=t.note;
      body.appendChild(n);
    }
    c.appendChild(body);

    if(writable){
      var acts = document.createElement("div");
      acts.className="acts";
      var ed = document.createElement("button");
      ed.type="button"; ed.className="ghost"; ed.textContent="✎"; ed.title="ویرایش";
      ed.addEventListener("click", function(){ openEdit(t); });
      var del = document.createElement("button");
      del.type="button"; del.className="ghost danger"; del.textContent="×"; del.title="حذف";
      del.addEventListener("click", function(){ deleteTask(t, del); });
      acts.appendChild(ed); acts.appendChild(del);
      c.appendChild(acts);
    }
    return c;
  }

  function moveTask(id, col, spec){
    if(!guard()) return;
    var t = tasks.filter(function(x){ return x.id === id; })[0];
    if(!t) return;
    var patch;
    if(spec && spec.byStage){
      var ns = col.key;
      if((t.progress || "") === ns) return;
      patch = {progress: ns, status: stageStatus(ns)};
      patch.doneAt = (ns === DONE_STAGE) ? todayISO() : {"__delete__":true};
    } else if(spec && spec.byArea){
      var newArea = (col.key === "بدون حوزه") ? "" : col.key;
      if((t.area || "") === newArea) return;
      patch = {area: newArea, sub: ""};
    } else {
      var newSub = (col.key === NO_SUB) ? "" : col.key;
      if((t.sub || "") === newSub) return;
      patch = {sub: newSub};
    }
    db.doc("tasks/" + id).update(patch).then(function(){ note(""); }, onWriteError);
  }

  function renderBoardView(){
    listEl.innerHTML = "";
    var shown = tasks.filter(visible);
    if(editingId && shown.every(function(t){ return t.id !== editingId; })){
      var ed = tasks.filter(function(t){ return t.id === editingId; })[0];
      if(ed) shown = shown.concat([ed]);
    }
    var spec = boardColumns(shown);
    var board = document.createElement("div");
    board.className = "board";
    board.id = "boardscroll";

    spec.cols.forEach(function(col){
      var mine = shown.filter(function(t){
        return spec.byStage ? ((t.progress || "شروع‌نشده") === col.key)
             : spec.byArea  ? ((t.area || "بدون حوزه") === col.key)
                            : ((t.sub || NO_SUB) === col.key);
      }).sort(sortNow);

      var c = document.createElement("section");
      c.className = "col";
      tint(c, col.key);
      (function(sec, key){
        var w = colwGet("b:" + key, 300);
        sec.style.flexBasis = w + "px";
        sec.appendChild(makeGrip("colgrip", "b:" + key, 300, 150, 1200, function(nw){
          sec.style.flexBasis = nw + "px";
        }));
      })(c, col.key);
      var h = document.createElement("div");
      h.className = "col-h";
      h.appendChild(document.createTextNode(col.label));
      var cnt = document.createElement("span");
      cnt.className = "c"; cnt.textContent = toFa(mine.length);
      h.appendChild(cnt);
      var lf = sumLeft(mine);
      if(lf > 0){
        var lb = document.createElement("span");
        lb.className = "c";
        lb.textContent = "ماندهٔ " + fmtW(lf);
        lb.title = "جمع حجم باقی‌ماندهٔ این ستون";
        h.appendChild(lb);
      }
      c.appendChild(h);

      /* ستونی که فرم ویرایش در آن باز است سقف ارتفاع ندارد، تا خود صفحه اسکرول شود */
      if(editingId && mine.some(function(t){ return t.id === editingId; })) c.classList.add("editing-col");
      var bodyEl = document.createElement("div");
      bodyEl.className = "col-body";
      if(mine.length){
        mine.forEach(function(t){ bodyEl.appendChild(cardFor(t)); });
      } else {
        var e = document.createElement("div");
        e.className = "col-empty";
        e.textContent = "خالی";
        bodyEl.appendChild(e);
      }
      if(writable){
        bodyEl.addEventListener("dragover", function(ev){
          ev.preventDefault();
          ev.dataTransfer.dropEffect = "move";
          bodyEl.classList.add("over");
        });
        bodyEl.addEventListener("dragleave", function(){ bodyEl.classList.remove("over"); });
        bodyEl.addEventListener("drop", function(ev){
          ev.preventDefault();
          bodyEl.classList.remove("over");
          var id = ev.dataTransfer.getData("text/plain");
          if(id) moveTask(id, col, spec);
        });
      }
      c.appendChild(bodyEl);
      board.appendChild(c);
    });

    listEl.appendChild(board);
    if(!shown.length){
      var em = document.createElement("div");
      em.className = "empty";
      em.style.marginTop = "10px";
      em.textContent = filter.q ? "چیزی با این جستجو پیدا نشد."
        : tasks.length ? "با این فیلتر کاری نیست." : "هنوز کاری ثبت نشده. دکمه «کار تازه» را بزنید.";
      listEl.appendChild(em);
    }
  }

  /* ============ پهنای ستون‌ها، با کشیدن خط جداکننده ============ */

  var COLW = {};
  try { COLW = JSON.parse(localStorage.getItem("colw") || "{}") || {}; } catch(e){ COLW = {}; }
  function saveColW(){
    try { localStorage.setItem("colw", JSON.stringify(COLW)); } catch(e){}
  }
  function colwGet(key, dflt){
    var v = Number(COLW[key]);
    return (isFinite(v) && v >= 60) ? v : dflt;
  }

  /* یک دستهٔ کشیدن می‌سازد: جهت راست‌به‌چپ، پس حرکت به چپ پهن می‌کند */
  function makeGrip(cls, key, dflt, minW, maxW, apply){
    var g = document.createElement("button");
    g.type = "button";
    g.className = cls;
    g.title = "برای تغییر پهنا بکشید — دوبار کلیک: اندازهٔ پیش‌فرض";
    g.setAttribute("aria-label", "تغییر پهنای ستون");
    g.addEventListener("mousedown", function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var startX = ev.clientX;
      var startW = colwGet(key, dflt);
      var rtl = getComputedStyle(document.documentElement).direction === "rtl";
      g.classList.add("dragging");
      document.body.classList.add("col-resizing");

      function move(e){
        var dx = e.clientX - startX;
        var w = startW + (rtl ? -dx : dx);
        w = Math.max(minW, Math.min(maxW, Math.round(w)));
        COLW[key] = w;
        apply(w);
      }
      function up(){
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        g.classList.remove("dragging");
        document.body.classList.remove("col-resizing");
        saveColW();
      }
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });
    g.addEventListener("dblclick", function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      delete COLW[key];
      saveColW();
      apply(dflt);
    });
    g.addEventListener("click", function(ev){ ev.stopPropagation(); });
    return g;
  }

  /* ============ نمای سطری: هر کار دقیقاً یک خط ============ */

  var ROWCOLS = [
    {label:"✓",        sort:"status",   cls:"num", key:"done",  w:38},
    {label:"امروز",    sort:"rank",     cls:"num", key:"rank",  w:62},
    {label:"شماره",    sort:"num",      cls:"num", key:"num",   w:62},
    {label:"کار",      sort:"title",    cls:"ttl", key:"title", w:330},
    {label:"پروژه",    sort:"project",  cls:"",    key:"proj",  w:140},
    {label:"اولویت",   sort:"prio",     cls:"",    key:"prio",  w:110},
    {label:"حوزه",     sort:"area",     cls:"",    key:"area",  w:140},
    {label:"زیردسته",  sort:"sub",      cls:"",    key:"sub",   w:170},
    {label:"شخص",      sort:"person",   cls:"",    key:"who",   w:120},
    {label:"مهلت",     sort:"due",      cls:"num", key:"due",   w:110},
    {label:"حجم",      sort:"load",     cls:"",    key:"size",  w:120},
    {label:"پیشرفت",   sort:"pct",      cls:"num", key:"pct",   w:130},
    {label:"مانده",    sort:"left",     cls:"num", key:"left",  w:70},
    {label:"یادداشت",  sort:null,       cls:"",    key:"note",  w:220},
    {label:"",         sort:null,       cls:"num", key:"acts",  w:120}
  ];
  /* یک <colgroup> پهناها را نگه می‌دارد تا کشیدن سرستون روی همهٔ سطرها اثر کند */
  function rowsColGroup(){
    var cg = document.createElement("colgroup");
    ROWCOLS.forEach(function(c){
      var el = document.createElement("col");
      el.style.width = colwGet("r:" + c.key, c.w) + "px";
      cg.appendChild(el);
    });
    return cg;
  }
  function rowsTotalW(){
    var t = 0;
    ROWCOLS.forEach(function(c){ t += colwGet("r:" + c.key, c.w); });
    return t;
  }

  /* فیلتر کلمه‌ای برای هر ستونِ نمای سطری */
  var colFilters = {};
  var colFilterFocus = null;
  function normDigits(s){
    return String(s == null ? "" : s)
      .replace(/[۰-۹]/g, function(d){ return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); })
      .replace(/[٠-٩]/g, function(d){ return "٠١٢٣٤٥٦٧٨٩".indexOf(d); });
  }
  function colText(t, key){
    switch(key){
      case "rank":  return t.rank != null ? String(t.rank) : "";
      case "num":   return t.num ? String(t.num) : "";
      case "title": return t.title || "";
      case "proj":  return t.project || "";
      case "prio":  return t.priority || "";
      case "area":  return t.area || "";
      case "sub":   return t.sub || "";
      case "who":   return t.person || "";
      case "due":   return t.due ? fmtShort(t.due) : "";
      case "size":  return sizeOf(t);
      case "pct":   return pctOf(t) + "٪ " + (t.progress || "");
      case "left":  return fmtW(taskLeft(t));
      case "note":  return t.note || "";
      default:      return "";
    }
  }
  function passesColFilters(t){
    for(var k in colFilters){
      var raw = (colFilters[k] || "").trim();
      if(!raw) continue;
      var text = normDigits(colText(t, k)).toLowerCase();
      /* فاصله = «یا»  ·  + = «و»  ·  ! جلوی یک کلمه = حذف
         کلمه‌های !دارِ تنها (با فاصله) همه باید نباشند؛ گروه‌های مثبت با فاصله «یا» می‌شوند. */
      var neg = [], groups = [];
      raw.split(/\s+/).forEach(function(tok){
        if(tok.indexOf("+") >= 0){                      // گروهِ «و»
          var g = [];
          tok.split("+").forEach(function(p){
            p = p.trim(); if(!p) return;
            if(p.charAt(0) === "!") g.push({neg:true,  term:normDigits(p.slice(1)).toLowerCase()});
            else                    g.push({neg:false, term:normDigits(p).toLowerCase()});
          });
          g = g.filter(function(x){ return x.term; });
          if(g.length) groups.push(g);
        } else if(tok.charAt(0) === "!"){               // حذفِ تنها
          var w = tok.slice(1).trim();
          if(w) neg.push(normDigits(w).toLowerCase());
        } else {                                        // مثبتِ تنها = گروه تک‌کلمه‌ای
          groups.push([{neg:false, term:normDigits(tok).toLowerCase()}]);
        }
      });
      for(var i = 0; i < neg.length; i++){
        if(text.indexOf(neg[i]) >= 0) return false;
      }
      if(groups.length){
        var any = groups.some(function(g){
          return g.every(function(it){
            var has = text.indexOf(it.term) >= 0;
            return it.neg ? !has : has;
          });
        });
        if(!any) return false;
      }
    }
    return true;
  }
  function anyColFilter(){
    for(var k in colFilters){ if((colFilters[k] || "").trim()) return true; }
    return false;
  }

  function renderRowsView(){
    listEl.innerHTML = "";
    var base = tasks.filter(visible);
    if(editingId && base.every(function(t){ return t.id !== editingId; })){
      var ed = tasks.filter(function(t){ return t.id === editingId; })[0];
      if(ed) base = base.concat([ed]);
    }
    if(!base.length){
      var e = document.createElement("div");
      e.className = "empty";
      e.textContent = filter.q ? "چیزی با این جستجو پیدا نشد."
        : tasks.length ? "با این فیلتر کاری نیست." : "هنوز کاری ثبت نشده. دکمه «کار تازه» را بزنید.";
      listEl.appendChild(e);
      return;
    }
    var shown = base.filter(function(t){ return t.id === editingId || passesColFilters(t); });
    shown = shown.slice().sort(sortNow);

    var tbl = document.createElement("table");
    tbl.className = "rows";
    var cg = rowsColGroup();
    tbl.appendChild(cg);
    tbl.style.minWidth = rowsTotalW() + "px";
    var thead = document.createElement("thead");
    var hr = document.createElement("tr");
    ROWCOLS.forEach(function(c, ci){
      var th = document.createElement("th");
      if(c.cls) th.className = c.cls;
      if(ci > 0){
        th.appendChild(makeGrip("thgrip", "r:" + c.key, c.w, 40, 900, function(nw){
          cg.children[ci].style.width = nw + "px";
          tbl.style.minWidth = rowsTotalW() + "px";
        }));
      }
      th.appendChild(document.createTextNode(c.label));
      if(c.sort){
        if(sortKey === c.sort){
          th.classList.add("on");
          th.appendChild(document.createTextNode(sortDir === 1 ? " ▾" : " ▴"));
          th.title = "یک بار دیگر بزنید تا ترتیب برعکس شود";
        } else {
          th.title = "چیدمان بر اساس " + (c.label || "این ستون");
        }
        th.addEventListener("click", function(){ setSort(c.sort, true); });
      } else {
        th.style.cursor = "default";
      }
      hr.appendChild(th);
    });
    thead.appendChild(hr);

    var ffr = document.createElement("tr");
    ffr.className = "rowfilters";
    ROWCOLS.forEach(function(c){
      var fh = document.createElement("th");
      if(c.cls) fh.className = c.cls;
      if(c.key !== "done" && c.key !== "acts"){
        var inp = document.createElement("input");
        inp.type = "text"; inp.className = "colfilter";
        inp.setAttribute("data-k", c.key);
        inp.value = colFilters[c.key] || "";
        inp.placeholder = "…";
        inp.title = "فاصله = یا · + = و · !کلمه = حذف. مثال: مقاله اکسل · مقاله+اکسل · !مقاله !اکسل";
        inp.setAttribute("aria-label", "فیلتر " + (c.label || c.key));
        inp.addEventListener("input", function(){
          colFilters[c.key] = inp.value;
          colFilterFocus = c.key;
          renderRowsView();
        });
        inp.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
        inp.addEventListener("click", function(ev){ ev.stopPropagation(); });
        fh.appendChild(inp);
      } else if(c.key === "acts"){
        var rb = document.createElement("button");
        rb.type = "button"; rb.className = "ghost"; rb.textContent = "پاک‌کردن فیلترها";
        rb.title = "همهٔ فیلترهای ستون‌ها پاک می‌شود";
        rb.disabled = !anyColFilter();
        rb.addEventListener("click", function(){
          colFilters = {}; colFilterFocus = null; renderRowsView();
        });
        rb.addEventListener("mousedown", function(ev){ ev.stopPropagation(); });
        fh.appendChild(rb);
      }
      ffr.appendChild(fh);
    });
    thead.appendChild(ffr);
    tbl.appendChild(thead);

    var tb = document.createElement("tbody");
    shown.forEach(function(t){
      var tr = document.createElement("tr");
      if(editingId === t.id){
        var td = document.createElement("td");
        td.colSpan = ROWCOLS.length;
        td.style.whiteSpace = "normal";
        td.appendChild(buildEditForm(t));
        tr.appendChild(td);
        tb.appendChild(tr);
        return;
      }
      if(t.status === "done") tr.className = "done";
      rankDrag(tr, t, false);

      function cell(node, cls){
        var d = document.createElement("td");
        if(cls) d.className = cls;
        if(node !== null && node !== undefined){
          if(typeof node === "string") d.appendChild(document.createTextNode(node));
          else d.appendChild(node);
        }
        tr.appendChild(d);
        return d;
      }

      var cb = document.createElement("input");
      cb.type = "checkbox"; cb.checked = t.status === "done";
      cb.setAttribute("aria-label","انجام شد");
      cb.disabled = !writable || !canTouch(t);
      cb.addEventListener("change", function(){ toggleTask(t, cb.checked, cb); });
      cell(cb, "num");

      cell(t.status === "done" ? "—" : rankInput(t), "num");
      cell(t.num ? toFa(t.num) : "—", "num");

      var ttl = cell(cellTitle(t), "ttl " + (PRIO_CLASS[t.priority] || "prio-mid"));
      ttl.title = (t.title || "") + (t.note ? " — " + t.note : "");

      cell(cellProject(t));

      cell(t.status === "done" ? "—" : prioSelect(t));
      cell(cellArea(t));
      cell(cellSub(t));
      cell(cellPerson(t));
      cell(t.status === "done"
        ? (t.due ? fmtShort(t.due) : "—")
        : labelled("", cellDue(t), t.due ? dueClass(t) : null), "num");
      cell(t.status === "done" ? sizeOf(t) : sizeSelect(t));

      var pc = document.createElement("span");
      pc.appendChild(pctBar(t));
      if(t.status !== "done"){ pc.appendChild(document.createTextNode(" ")); pc.appendChild(pctSelect(t)); }
      else pc.appendChild(document.createTextNode(" " + toFa(100) + "٪"));
      pc.appendChild(document.createTextNode(" ")); pc.appendChild(progSelect(t));
      cell(pc, "num");

      cell(fmtW(taskLeft(t)), "num");
      cell(cellNote(t), "nt");

      if(writable && canTouch(t)){
        var acts = document.createElement("span");
        var ed2 = document.createElement("button");
        ed2.type = "button"; ed2.className = "ghost"; ed2.textContent = "ویرایش";
        ed2.addEventListener("click", function(){ openEdit(t); });
        acts.appendChild(ed2);
        if(isOwner()){
          var del = document.createElement("button");
          del.type = "button"; del.className = "ghost danger"; del.textContent = "حذف";
          del.addEventListener("click", function(){ deleteTask(t, del); });
          acts.appendChild(del);
        }
        cell(acts, "num");
      } else cell("—", "num");

      tb.appendChild(tr);
    });
    if(!shown.length){
      var er = document.createElement("tr");
      var ec = document.createElement("td");
      ec.colSpan = ROWCOLS.length;
      ec.className = "empty"; ec.style.textAlign = "center";
      ec.textContent = "با این فیلترِ ستون‌ها کاری نیست.";
      er.appendChild(ec); tb.appendChild(er);
    }
    tbl.appendChild(tb);

    var tf = document.createElement("tfoot");
    var fr = document.createElement("tr");
    var f1 = document.createElement("td");
    f1.colSpan = ROWCOLS.length - 2;
    f1.textContent = toFa(shown.length) + " کار در این نما";
    fr.appendChild(f1);
    var f2 = document.createElement("td");
    f2.className = "num"; f2.textContent = "جمع مانده";
    fr.appendChild(f2);
    var f3 = document.createElement("td");
    f3.className = "num"; f3.innerHTML = "<b>" + fmtW(sumLeft(shown)) + "</b>";
    fr.appendChild(f3);
    tf.appendChild(fr);
    tbl.appendChild(tf);

    var wrap = document.createElement("div");
    wrap.className = "rowswrap";
    wrap.appendChild(tbl);
    listEl.appendChild(wrap);
    if(colFilterFocus){
      var a = listEl.querySelector('.colfilter[data-k="' + colFilterFocus + '"]');
      if(a){ a.focus(); var v = a.value; try{ a.setSelectionRange(v.length, v.length); }catch(_){} }
    }
  }

  function renderList(){
    if(INLINE){ RENDER_HELD = true; return; }
    var draw = function(){
      if(VIEW === "board") renderBoardView();
      else if(VIEW === "rows") renderRowsView();
      else renderListView();
    };
    try { draw(); }
    catch(e){
      /* یک خطای یک ردیف نباید کل فهرست را خالی کند: ویرایش را ببند و یک بار دیگر تلاش کن */
      try { console.error(e); } catch(_){}
      editingId = null; draft = null;
      try { draw(); note("فرم ویرایش بسته شد چون خطایی رخ داد؛ فهرست سر جایش است.", true); }
      catch(e2){
        listEl.innerHTML = "";
        var d = document.createElement("div");
        d.className = "empty";
        d.textContent = "نمایش فهرست با خطا مواجه شد. صفحه را دوباره باز کنید.";
        listEl.appendChild(d);
      }
    }
  }

  function setView(v){
    VIEW = v;
    try { localStorage.setItem("view", v); } catch(e){}
    $("v-board").setAttribute("aria-pressed", v === "board" ? "true" : "false");
    $("v-list").setAttribute("aria-pressed", v === "list" ? "true" : "false");
    $("v-rows").setAttribute("aria-pressed", v === "rows" ? "true" : "false");
    if(v === "board") filter.sub = "all";
    try { applyWidth(); } catch(e){}
    renderTabs();
    renderList();
  }

  function renderPeople(){
    var box = $("people");
    box.innerHTML = "";
    allPeople().forEach(function(p){
      var on = hasLogin(p);
      var tag = document.createElement("span");
      tag.className = "subtag" + (on ? " haslogin" : "");
      tag.appendChild(document.createTextNode(p));

      if(isOwner()){
        var lb = document.createElement("label");
        lb.className = "whois ck";
        lb.title = on
          ? "تیک را بردارید تا حسابش برداشته شود و فقط یک نام بماند"
          : "تیک بزنید تا حساب و لینک بگیرد و کارهای خودش را ببیند";
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = on;
        cb.addEventListener("change", function(){ setLogin(p, cb.checked, cb); });
        lb.appendChild(cb);
        lb.appendChild(document.createTextNode("کاربر"));
        tag.appendChild(lb);

        if(on){
          var pw = document.createElement("i");
          pw.className = "whois";
          pw.textContent = hasPass(p) ? "رمز دارد" : "بی‌رمز";
          pw.title = hasPass(p)
            ? "رمز ساخته است و با همان وارد می‌شود"
            : "هنوز رمزی نساخته؛ بار اول که لینکش را باز کند، رمز می‌سازد";
          tag.appendChild(pw);

          if(hasPass(p)){
            var rp = document.createElement("button");
            rp.type = "button"; rp.className = "ghost"; rp.textContent = "بازنشانی رمز";
            rp.title = "رمزش را پاک می‌کند و نشست‌هایش را می‌بندد";
            rp.addEventListener("click", function(){ resetPass(p, rp); });
            tag.appendChild(rp);
          }

          LINK_HOSTS.forEach(function(h){
            var cp = document.createElement("button");
            cp.type = "button"; cp.className = "ghost";
            cp.textContent = "کپی لینک " + h.label;
            cp.title = "لینک " + h.label + " " + p + " — " + h.base;
            cp.addEventListener("click", function(){
              var u = loginURLon(p, h.base);
              if(!u) return;
              if(navigator.clipboard && navigator.clipboard.writeText){
                navigator.clipboard.writeText(u).then(function(){
                  note("لینک " + h.label + " " + p + " کپی شد.");
                }, function(){ note(u); });
              } else note(u);
            });
            tag.appendChild(cp);
          });
        }
      } else {
        var bq = document.createElement("i");
        bq.className = "whois";
        bq.textContent = on ? "کاربر" : "نام";
        tag.appendChild(bq);
      }

      if(people.indexOf(p) >= 0){
        var x = document.createElement("button");
        x.type="button"; x.className="ghost"; x.textContent="×"; x.title="حذف از فهرست";
        x.addEventListener("click", function(){ removePerson(p); });
        tag.appendChild(x);
      }
      box.appendChild(tag);
    });
    if(!box.children.length){
      var s = document.createElement("span");
      s.className="sub"; s.textContent="هنوز شخصی ثبت نشده.";
      box.appendChild(s);
    }
  }

  /* ============ دسترسی‌ها ============ */

  var ROLES = [["manager","مدیر حوزه"],["member","عضو"],["viewer","ناظر"]];
  function isRole(r){ for(var i=0;i<ROLES.length;i++){ if(ROLES[i][0]===r) return true; } return false; }

  function aclOf(name){
    var a = (acl && acl[name]) || {};
    function g(v){ return v==="all" ? "all" : (Array.isArray(v) ? v.slice() : []); }
    return {
      role: isRole(a.role) ? a.role : "member",
      email: a.email || "",
      seeAreas: g(a.seeAreas),
      seePeople: g(a.seePeople),
      assignTo: g(a.assignTo)
    };
  }
  function presetFor(role){
    if(role === "manager") return {seeAreas:[], seePeople:[], assignTo:"all"};
    if(role === "viewer")  return {seeAreas:"all", seePeople:[], assignTo:[]};
    return {seeAreas:[], seePeople:[], assignTo:[]};
  }
  function saveAcl(name, entry){
    if(!guard()) return;
    var next = {};
    Object.keys(acl || {}).forEach(function(k){ next[k] = acl[k]; });
    next[name] = entry;
    acl = next;
    renderAcl();
    db.doc("config/access").set({roles: next}).then(function(){ note(""); }, onWriteError);
  }
  function dropAcl(name){
    if(!db || !acl || !acl[name]) return;
    var next = {};
    Object.keys(acl).forEach(function(k){ if(k !== name) next[k] = acl[k]; });
    acl = next;
    db.doc("config/access").set({roles: next}).then(function(){}, function(){});
  }

  function aclSummary(e){
    var sees = ["کارهای خودش"];
    if(e.seeAreas === "all") sees.push("همهٔ حوزه‌ها");
    else if(e.seeAreas.length) sees.push("حوزهٔ " + e.seeAreas.join(" و "));
    if(e.seePeople === "all") sees.push("کارهای همهٔ افراد");
    else if(e.seePeople.length) sees.push("کارهای " + e.seePeople.join(" و "));

    var give;
    if(e.assignTo === "all") give = "به هر کسی می‌تواند کار بدهد";
    else if(e.assignTo.length) give = "فقط به " + e.assignTo.join(" و ") + " می‌تواند کار بدهد";
    else give = "به کسی کار نمی‌دهد";

    var edit = e.role === "viewer" ? "هیچ چیزی را تغییر نمی‌دهد"
             : e.role === "manager" ? "پیشرفت هر کاری که می‌بیند را تغییر می‌دهد"
             : "پیشرفت کارهای خودش را تغییر می‌دهد";

    return "می‌بیند: " + sees.join(" + ") + " — " + edit + " — " + give + ".";
  }

  function pkChip(label, on, onToggle){
    var l = document.createElement("label");
    l.className = "pk" + (on ? " on" : "");
    var cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = on;
    cb.addEventListener("change", function(){ onToggle(cb.checked); });
    l.appendChild(cb);
    l.appendChild(document.createTextNode(label));
    return l;
  }
  function pkGroup(label, items, value, onChange){
    var row = document.createElement("div");
    row.className = "pickrow";
    var lb = document.createElement("span");
    lb.className = "pklabel"; lb.textContent = label;
    row.appendChild(lb);

    var every = value === "all";
    var allChip = pkChip("همه", every, function(on){ onChange(on ? "all" : []); });
    allChip.classList.add("all");
    row.appendChild(allChip);

    items.forEach(function(it){
      var on = every || value.indexOf(it) >= 0;
      var c = pkChip(it, on, function(checked){
        var cur = value.slice();
        if(checked){ if(cur.indexOf(it) < 0) cur.push(it); }
        else { cur = cur.filter(function(x){ return x !== it; }); }
        onChange(cur);
      });
      if(every){ c.querySelector("input").disabled = true; c.title = "با برداشتن تیک «همه» می‌توانید تک‌تک را انتخاب کنید"; }
      row.appendChild(c);
    });
    if(!items.length){
      var s = document.createElement("span");
      s.className = "sub"; s.textContent = "—";
      row.appendChild(s);
    }
    return row;
  }

  function renderAcl(){
    var box = $("acl");
    if(!box) return;
    box.innerHTML = "";
    var everyone = allPeople().filter(hasLogin);
    var areaNames = (cats.areas || []).map(function(a){ return a.name; });

    if(!everyone.length){
      var s = document.createElement("p");
      s.className = "sub";
      s.textContent = "هنوز کسی حساب ندارد. در فهرست اشخاص بالا، تیک «کاربر» را برای هر کس "
        + "که می‌خواهید بزنید؛ پنجرهٔ تنظیم دسترسی‌اش همان لحظه همین‌جا ساخته می‌شود.";
      box.appendChild(s);
      return;
    }

    everyone.forEach(function(name){
      var e = aclOf(name);
      var block = document.createElement("div");
      block.className = "aclblock";
      tint(block, name);

      var head = document.createElement("div");
      head.className = "row";
      var nm = document.createElement("strong");
      nm.textContent = name;
      nm.style.flex = "0 0 auto";
      head.appendChild(nm);

      var roleSel = document.createElement("select");
      roleSel.className = "w150";
      roleSel.setAttribute("aria-label", "نقش " + name);
      ROLES.forEach(function(r){
        var o = document.createElement("option");
        o.value = r[0]; o.textContent = r[1];
        roleSel.appendChild(o);
      });
      roleSel.value = e.role;
      roleSel.addEventListener("change", function(){
        var p = presetFor(roleSel.value);
        saveAcl(name, {role: roleSel.value, email: e.email,
                       seeAreas: p.seeAreas, seePeople: p.seePeople, assignTo: p.assignTo});
      });
      head.appendChild(roleSel);

      var mail = document.createElement("input");
      mail.type = "email"; mail.className = "w190"; mail.value = e.email;
      mail.placeholder = "ایمیل (اختیاری)";
      mail.title = "فقط برای دعوت به اپ و فرستادن کار به تقویم خودش لازم است";
      mail.setAttribute("aria-label", "ایمیل " + name);
      mail.addEventListener("change", function(){
        var v = mail.value.trim();
        saveAcl(name, {role: e.role, email: v,
                       seeAreas: e.seeAreas, seePeople: e.seePeople, assignTo: e.assignTo});
      });
      head.appendChild(mail);

      var n = tasks.filter(function(t){ return t.person === name && t.status === "open"; }).length;
      var cnt = document.createElement("span");
      cnt.className = "cat-count";
      cnt.textContent = n ? toFa(n) + " کار باز" : "بدون کار باز";
      head.appendChild(cnt);
      var lnk = document.createElement("span");
      lnk.className = "cat-count";
      lnk.textContent = "کاربر";
      head.appendChild(lnk);
      block.appendChild(head);


      var sum = document.createElement("div");
      sum.className = "acl-sum";
      sum.textContent = aclSummary(e);
      block.appendChild(sum);

      block.appendChild(pkGroup("حوزه‌هایی که می‌بیند", areaNames, e.seeAreas, function(v){
        saveAcl(name, {role:e.role, email:e.email, seeAreas:v, seePeople:e.seePeople, assignTo:e.assignTo});
      }));
      var others = everyone.filter(function(p){ return p !== name; });
      block.appendChild(pkGroup("کارهای چه کسانی را می‌بیند", others, e.seePeople, function(v){
        saveAcl(name, {role:e.role, email:e.email, seeAreas:e.seeAreas, seePeople:v, assignTo:e.assignTo});
      }));
      block.appendChild(pkGroup("به چه کسانی کار می‌دهد", others, e.assignTo, function(v){
        saveAcl(name, {role:e.role, email:e.email, seeAreas:e.seeAreas, seePeople:e.seePeople, assignTo:v});
      }));

      box.appendChild(block);
    });
  }

  /* تأیید دو‌مرحله‌ای روی خود دکمه — پنجرهٔ هشدار در این قالب کار نمی‌کند */
  function confirmable(btn, askLabel, onYes){
    var original = btn.textContent, armed = false, timer = null;
    btn.addEventListener("click", function(){
      if(armed){
        armed = false;
        if(timer) clearTimeout(timer);
        btn.textContent = original;
        onYes();
        return;
      }
      armed = true;
      btn.textContent = askLabel;
      timer = setTimeout(function(){ armed = false; btn.textContent = original; }, 4000);
    });
  }

  function renderCats(){
    var box = $("cats");
    box.innerHTML = "";
    (cats.areas||[]).forEach(function(a, idx){
      var block = document.createElement("div");
      block.className="areablock";
      tint(block, a.name);
      var line = document.createElement("div");
      line.className="row";
      var nameIn = document.createElement("input");
      nameIn.type="text"; nameIn.value=a.name; nameIn.className="grow";
      nameIn.setAttribute("aria-label","نام حوزه");
      nameIn.addEventListener("change", function(){
        var v = nameIn.value.trim();
        if(!v){ nameIn.value = a.name; return; }
        renameArea(idx, v);
      });
      line.appendChild(nameIn);
      [["↑",-1],["↓",1]].forEach(function(pair){
        var b = document.createElement("button");
        b.type="button"; b.textContent=pair[0];
        b.addEventListener("click", function(){ moveArea(idx, pair[1]); });
        line.appendChild(b);
      });
      var na = countInArea(a.name);
      var acnt = document.createElement("span");
      acnt.className = "cat-count";
      acnt.textContent = na ? toFa(na) + " کار" : "خالی";
      line.appendChild(acnt);
      var rm = document.createElement("button");
      rm.type="button"; rm.className="ghost danger"; rm.textContent="حذف حوزه";
      rm.title = na ? "حذف حوزه — " + toFa(na) + " کار بی‌حوزه می‌شوند" : "حذف حوزه";
      confirmable(rm, "حذف؟", function(){ removeArea(idx); });
      line.appendChild(rm);
      block.appendChild(line);

      var subs = document.createElement("div");
      subs.className="sublist";
      (a.subs||[]).forEach(function(s, si){
        var rowS = document.createElement("div");
        rowS.className = "subrow";
        tint(rowS, s);
        var dot = document.createElement("span");
        dot.className = "catdot";
        rowS.appendChild(dot);

        var subIn = document.createElement("input");
        subIn.type = "text"; subIn.value = s;
        subIn.setAttribute("aria-label","نام زیردسته");
        subIn.addEventListener("change", function(){
          var v = subIn.value.trim();
          if(!v){ subIn.value = s; return; }
          renameSub(idx, si, v);
        });
        rowS.appendChild(subIn);

        var n = countInSub(a.name, s);
        var cnt = document.createElement("span");
        cnt.className = "cat-count";
        cnt.textContent = n ? toFa(n) + " کار" : "خالی";
        rowS.appendChild(cnt);

        [["↑",-1],["↓",1]].forEach(function(pair){
          var b = document.createElement("button");
          b.type="button"; b.className="mini"; b.textContent=pair[0];
          b.title = pair[1] < 0 ? "بالاتر" : "پایین‌تر";
          b.addEventListener("click", function(){ moveSub(idx, si, pair[1]); });
          rowS.appendChild(b);
        });
        var x = document.createElement("button");
        x.type="button"; x.className="ghost danger mini"; x.textContent="حذف";
        x.title = n ? "حذف زیردسته — " + toFa(n) + " کار بی‌زیردسته می‌شوند" : "حذف زیردسته";
        confirmable(x, "حذف؟", function(){ removeSub(idx, si); });
        rowS.appendChild(x);
        subs.appendChild(rowS);
      });
      block.appendChild(subs);

      var f = document.createElement("form");
      f.className="row"; f.style.marginTop="8px";
      var w = document.createElement("div"); w.className="grow";
      var ns = document.createElement("input");
      ns.type="text"; ns.placeholder="زیردسته تازه…"; ns.setAttribute("aria-label","زیردسته تازه");
      w.appendChild(ns);
      var b2 = document.createElement("button"); b2.type="submit"; b2.textContent="افزودن";
      f.appendChild(w); f.appendChild(b2);
      f.addEventListener("submit", function(ev){
        ev.preventDefault();
        var v = ns.value.trim(); if(!v) return;
        ns.value=""; addSub(idx, v);
      });
      block.appendChild(f);
      box.appendChild(block);
    });
  }

  /* ============ پنجرهٔ وضعیت امروز (زنده) ============ */

  function tpRow(parent, label, count, onClick, tintName){
    var b = document.createElement("button");
    b.type = "button"; b.className = "tp-row";
    if(tintName){
      tint(b, tintName);
      var d = document.createElement("span");
      d.className = "dot";
      b.appendChild(d);
    }
    var t = document.createElement("span");
    t.className = "t2"; t.textContent = label;
    b.appendChild(t);
    if(count !== null && count !== undefined){
      var n = document.createElement("span");
      n.className = "n"; n.textContent = toFa(count);
      b.appendChild(n);
    }
    b.addEventListener("click", onClick);
    if(parent.className === "tp-sect") b.classList.add("tp-opt");
    parent.appendChild(b);
    return b;
  }
  function tpSection(parent, title, count){
    var s = document.createElement("div");
    s.className = "tp-sect";
    var h = document.createElement("h3");
    h.textContent = (count === undefined || count === null)
      ? title : (title + " (" + toFa(count) + ")");
    s.appendChild(h);
    parent.appendChild(s);
    return s;
  }

  /* پنجره نباید اسکرول بخورد: سطرهای اضافی از ته حذف می‌شوند تا جا شود */
  function fitToday(){
    var box = $("today");
    if(!box || box.hidden) return;
    if(box.scrollHeight <= box.clientHeight + 1) return;
    var guard = 300;
    while(box.scrollHeight > box.clientHeight + 1 && guard-- > 0){
      var opts = box.querySelectorAll(".tp-opt");
      if(!opts.length) break;
      var last = opts[opts.length - 1];
      var sect = last.parentNode;
      sect.removeChild(last);
      if(sect.className === "tp-sect" && !sect.querySelector(".tp-row,.tp-bar,.tp-empty")){
        if(sect.parentNode) sect.parentNode.removeChild(sect);
      }
    }
  }

  function renderToday(){
    var box = $("today");
    if(!box) return;
    if(panelHidden){ box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = "";

    var open = tasks.filter(function(t){ return t.status !== "done"; });
    var today = todayISO();
    var dueToday = open.filter(function(t){ return t.due && daysLeft(t.due) === 0; });
    var overdue  = open.filter(function(t){ var d = daysLeft(t.due); return d !== null && d < 0; });
    var remToday = open.filter(remindDue);
    var doneToday = tasks.filter(function(t){ return t.status === "done" && t.doneAt === today; });
    var waiting = open.filter(function(t){ return t.progress === "منتظر بررسی"; });
    var doing   = open.filter(function(t){ return t.progress === "در حال انجام" || t.progress === "تأیید"; });
    var notYet  = open.filter(function(t){ return t.progress === "شروع‌نشده"; });
    var soon = open.filter(function(t){ var d = daysLeft(t.due); return d !== null && d > 0 && d <= 7; });

    var head = document.createElement("div");
    head.className = "tp-h";
    var h2 = document.createElement("h2");
    h2.textContent = "وضعیت امروز";
    var dt = document.createElement("span");
    dt.className = "tp-date";
    dt.textContent = fmtDate(today);
    head.appendChild(h2); head.appendChild(dt);
    box.appendChild(head);

    var tiles = document.createElement("div");
    tiles.className = "tp-tiles";
    [[open.length,"فعال",""],[dueToday.length,"مهلت امروز","warn"],
     [overdue.length,"عقب‌افتاده","crit"],[doneToday.length,"انجام امروز","ok"],
     [fmtW(sumLeft(open)),"حجم مانده",""],
     [fmtW(sumLeft(dueToday.concat(overdue))),"ماندهٔ امروز","warn"]].forEach(function(p){
      var d = document.createElement("div");
      d.className = "tp-tile" + (p[2] ? " " + p[2] : "");
      var b = document.createElement("b");
      b.textContent = typeof p[0] === "number" ? toFa(p[0]) : String(p[0]);
      var s = document.createElement("span"); s.textContent = p[1];
      d.appendChild(b); d.appendChild(s);
      tiles.appendChild(d);
    });
    box.appendChild(tiles);

    /* پیشرفت کارهای باز */
    var ps = tpSection(box, "پیشرفت کارهای باز");
    var total = Math.max(open.length, 1);
    var bar = document.createElement("div");
    bar.className = "tp-bar";
    [[doing.length,"var(--accent)"],[waiting.length,"var(--warn)"],[notYet.length,"var(--line)"]].forEach(function(p){
      if(!p[0]) return;
      var i = document.createElement("i");
      i.style.width = (p[0]/total*100) + "%";
      i.style.background = p[1];
      bar.appendChild(i);
    });
    ps.appendChild(bar);
    var lg = document.createElement("div");
    lg.className = "tp-legend";
    [["در حال انجام/تأیید",doing.length,"var(--accent)"],["منتظر بررسی",waiting.length,"var(--warn)"],["شروع‌نشده",notYet.length,"var(--line)"]]
      .forEach(function(p){
        var s = document.createElement("span");
        var i = document.createElement("i"); i.style.background = p[2];
        s.appendChild(i);
        s.appendChild(document.createTextNode(p[0] + " " + toFa(p[1])));
        lg.appendChild(s);
      });
    ps.appendChild(lg);

    function taskList(sect, items, max){
      if(!items.length){
        var e = document.createElement("div");
        e.className = "tp-empty"; e.textContent = "موردی نیست.";
        sect.appendChild(e);
        return;
      }
      items.slice().sort(sortTasks).slice(0, max).forEach(function(t){
        var lbl = t.title;
        var d = daysLeft(t.due);
        if(d !== null && d < 0) lbl += " · " + toFa(Math.abs(d)) + " روز گذشته";
        else if(d !== null && d > 0) lbl += " · " + toFa(d) + " روز";
        tpRow(sect, lbl, null, function(){
          filter.q = ""; $("x-search").value = "";
          openEdit(t);
        }, t.sub || t.area);
      });
      if(items.length > max){
        var m = document.createElement("div");
        m.className = "tp-empty tp-opt";
        m.textContent = "و " + toFa(items.length - max) + " مورد دیگر";
        sect.appendChild(m);
      }
    }

    var plan = rankedToday();
    if(plan.length){
      var sp = tpSection(box, "برنامهٔ امروز", plan.length);
      plan.slice(0, 8).forEach(function(t){
        tpRow(sp, toFa(rankOf(t)) + ". " + t.title, null, function(){
          filter.q = ""; $("x-search").value = "";
          openEdit(t);
        }, t.sub || t.area);
      });
      if(plan.length > 8){
        var mm = document.createElement("div");
        mm.className = "tp-empty tp-opt";
        mm.textContent = "و " + toFa(plan.length - 8) + " مورد دیگر";
        sp.appendChild(mm);
      }
    }
    if(overdue.length) taskList(tpSection(box, "عقب‌افتاده", overdue.length), overdue, 5);
    if(dueToday.length || remToday.length){
      var s1 = tpSection(box, "امروز");
      var merged = dueToday.slice();
      remToday.forEach(function(t){ if(merged.indexOf(t) < 0) merged.push(t); });
      s1.firstChild.textContent = "امروز (" + toFa(merged.length) + ")";
      taskList(s1, merged, 6);
    }
    if(soon.length) taskList(tpSection(box, "هفت روز آینده", soon.length), soon, 5);

    if(waiting.length){
      var s2 = tpSection(box, "منتظر بررسی", waiting.length);
      var byPerson = {};
      waiting.forEach(function(t){ var k = t.person || "بی‌نام"; byPerson[k] = (byPerson[k]||0)+1; });
      Object.keys(byPerson).sort(function(a,b){ return byPerson[b]-byPerson[a]; }).slice(0,6).forEach(function(p){
        tpRow(s2, p, byPerson[p], function(){
          filter.prog = "منتظر بررسی"; if($("x-prog")) $("x-prog").value = "منتظر بررسی";
          if(p !== "بی‌نام"){ filter.person = p; }
          renderTabs(); renderList(); renderToday();
        });
      });
    }

    var s3 = tpSection(box, "به تفکیک حوزه");
    var order = areaNames(), groups = {};
    open.forEach(function(t){ var k = t.area || "بدون حوزه"; groups[k] = (groups[k]||0)+1; });
    var keys = Object.keys(groups).sort(function(a,b){
      var ia = order.indexOf(a), ib = order.indexOf(b);
      if(ia < 0) ia = 99; if(ib < 0) ib = 99;
      return ia - ib || a.localeCompare(b,"fa");
    });
    if(!keys.length){
      var e2 = document.createElement("div");
      e2.className = "tp-empty"; e2.textContent = "کار بازی نیست.";
      s3.appendChild(e2);
    }
    keys.forEach(function(k){
      tpRow(s3, k, groups[k], function(){
        filter.area = k; filter.sub = "all";
        renderTabs(); renderList(); renderToday();
      }, k);
    });

    var foot = document.createElement("div");
    foot.className = "tp-live";
    foot.style.marginTop = "8px";
    foot.textContent = "زنده — با هر تغییر به‌روز می‌شود";
    box.appendChild(foot);

    fitToday();
  }

  function renderAll(){
    renderPickers();
    renderCounts();
    renderReminders();
    renderTabs();
    renderList();
    renderToday();
    renderCats();
    renderPeople();
    renderAcl();
  }

  /* ============ نوشتن ============ */

  function guard(){
    if(!db){ note("این صفحه الان به پایگاه داده وصل نیست، پس تغییرات ذخیره نمی‌شود. صفحه را دوباره باز کنید.", true); return false; }
    if(!writable){ note("این نمایش اجازه نوشتن ندارد.", true); return false; }
    return true;
  }
  function onWriteError(e){
    var code = e && e.code;
    if(code === "invalid_argument"){
      writable = false;
      note("اجازه نوشتن در این نمایش وجود ندارد؛ فهرست فقط خواندنی شد.", true);
      renderAll();
    } else if(code === "quota_exceeded"){
      note("ظرفیت پایگاه داده پر است. چند کار قدیمی را حذف کنید.", true);
    } else if(code === "resource_exhausted"){
      note("تعداد درخواست‌ها زیاد شد. چند لحظه صبر کنید و دوباره بزنید.", true);
    } else {
      note("ذخیره نشد. چند لحظه بعد دوباره امتحان کنید.", true);
    }
  }
  function rememberPerson(name){
    if(!name || !db) return;
    if(people.indexOf(name) >= 0) return;
    db.doc("config/people").set({names: people.concat([name])}).then(function(){}, function(){});
  }
  function addTask(data){
    if(!guard()) return;
    db.collection("tasks").add(data).then(function(){ note(""); rememberPerson(data.person); }, onWriteError);
  }
  function toggleTask(t, done, cb){
    if(!guard()){ cb.checked = !done; return; }
    cb.disabled = true;
    var patch = done
      ? {status:"done", progress:"انجام‌شده", doneAt: todayISO()}
      : {status:"open", progress:"در حال انجام", doneAt:{"__delete__":true}};
    db.doc("tasks/" + t.id).update(patch).then(function(){
      cb.disabled = false; note("");
      if(done && t.repeat){
        var nd = nextDue(t);
        var left = repeatLeftOf(t);
        var nextTask = {
          title:t.title, area:t.area, sub:t.sub, due:nd,
          priority:t.priority, person:t.person, project:t.project||"",
          size:sizeOf(t), pct:0, progress:"شروع‌نشده", num:nextNum(),
          repeat:t.repeat, repeatEvery:repEvery(t), repeatUnit:repUnit(t),
          repeatDays:repDays(t), repeatEnd:t.repeatEnd||"never",
          repeatCount:t.repeatCount||0,
          repeatLeft: (t.repeatEnd === "count" && left !== null) ? left - 1 : null,
          repeatUntil:t.repeatUntil||"",
          status:"open", note:t.note||"", createdAt:new Date().toISOString()
        };
        var rp2 = remindPatch(remindersOf(t));
        nextTask.reminders = rp2.reminders;
        nextTask.remindAt = rp2.remindAt;
        nextTask.remindLead = rp2.remindLead;
        db.collection("tasks").add(nextTask).then(function(){
          note("نسخه بعدی این کار برای " + fmtDate(nd) + " ساخته شد.");
        }, function(){ note("کار تیک خورد، ولی ساختن نسخه بعدی انجام نشد.", true); });
      }
    }, function(e){ cb.disabled=false; cb.checked=!done; onWriteError(e); });
  }
  function setPriority(t, value, sel){
    if(!guard()){ sel.value = t.priority || "متوسط"; return; }
    sel.disabled = true;
    db.doc("tasks/" + t.id).update({priority: value}).then(function(){
      sel.disabled = false; note("");
    }, function(e){ sel.disabled = false; sel.value = t.priority || "متوسط"; onWriteError(e); });
  }

  function setProgress(t, value, sel){
    if(!guard()){ sel.value = t.progress || "شروع‌نشده"; return; }
    sel.disabled = true;
    var patch = {progress:value, status: stageStatus(value)};
    patch.doneAt = (value === DONE_STAGE) ? todayISO() : {"__delete__":true};
    db.doc("tasks/" + t.id).update(patch).then(function(){
      sel.disabled=false; note("");
    }, function(e){ sel.disabled=false; sel.value=t.progress||"شروع‌نشده"; onWriteError(e); });
  }
  /* فقط همان یادآوری که رسیده به فردا می‌رود؛ بقیه دست نمی‌خورند */
  function snoozeTask(t, btn){
    if(!guard()) return;
    btn.disabled = true;
    var hit = dueMoment(t);
    var list = remindersOf(t);
    var moved = false;
    if(hit){
      for(var i = 0; i < list.length; i++){
        if(list[i] === hit.r || (list[i].at === hit.r.at && list[i].lead === hit.r.lead
            && list[i].time === hit.r.time)){
          list[i] = {lead: null, at: shiftDays(todayISO(), 1), time: hit.time};
          moved = true;
          break;
        }
      }
    }
    if(!moved) list = [{lead: null, at: shiftDays(todayISO(), 1), time: DEF_TIME}];
    db.doc("tasks/" + t.id).update(remindPatch(list))
      .then(function(){ note(""); }, function(e){ btn.disabled=false; onWriteError(e); });
  }
  function clearRemind(t, btn){
    if(!guard()) return;
    btn.disabled = true;
    db.doc("tasks/" + t.id).update(remindPatch([]))
      .then(function(){ note(""); }, function(e){ btn.disabled=false; onWriteError(e); });
  }
  function deleteTask(t, btn){
    if(!guard()) return;
    btn.disabled = true;
    db.doc("tasks/" + t.id).delete().then(function(){ note(""); }, function(e){ btn.disabled=false; onWriteError(e); });
  }
  function openEdit(t){
    editingId = t.id;
    draft = {
      title:t.title||"", area:t.area||"", sub:t.sub||"", due:t.due||"",
      priority: PRIOS.indexOf(t.priority)>=0 ? t.priority : "متوسط",
      person:t.person||"", project:t.project||"",
      reminders: remindersOf(t),
      repeatEvery: repEvery(t), repeatUnit: repUnit(t), repeatDays: repDays(t),
      repeatEnd: t.repeatEnd || "never", repeatCount: t.repeatCount || 0,
      repeatLeft: (t.repeatLeft === null || t.repeatLeft === undefined) ? null : t.repeatLeft,
      repeatUntil: t.repeatUntil || "",
      size: sizeOf(t), pct: pctOf(t),
      progress: PROGS.indexOf(t.progress) >= 0 ? t.progress : "شروع‌نشده",
      remindLead:(t.remindLead===undefined||t.remindLead===null)?"":String(t.remindLead),
      remindAt:t.remindAt||"", repeat:t.repeat||"", note:t.note||""
    };
    renderList();
    /* فرم تازه باز‌شده را در دید بیاور */
    setTimeout(function(){
      var el = listEl.querySelector(".editing-col") || listEl.querySelector(".editing");
      if(el && el.scrollIntoView) el.scrollIntoView({block:"nearest", inline:"nearest"});
    }, 0);
  }
  function saveEdit(t, btn){
    if(!guard()) return;
    var title = (draft.title||"").trim();
    if(!title){ note("عنوان کار نمی‌تواند خالی باشد.", true); return; }
    btn.disabled = true;
    var person = (draft.person||"").trim();
    var patch = {
      title:title, area:draft.area||"", sub:draft.sub||"", due:draft.due||"",
      priority:draft.priority||"متوسط", person:person,
      project: (draft.project||"").trim(),
      size: SIZE_NAMES.indexOf(draft.size) >= 0 ? draft.size : "متوسط",
      pct: pctOf({pct: draft.pct, status: "open"}),
      repeat: draft.repeat||"", note: draft.note||"",
      repeatEvery: repEvery(draft), repeatUnit: repUnit(draft), repeatDays: repDays(draft),
      repeatEnd: draft.repeatEnd || "never",
      repeatCount: draft.repeatCount || 0,
      repeatLeft: draft.repeatEnd === "count"
        ? (draft.repeatLeft === null ? (draft.repeatCount || 0) : draft.repeatLeft)
        : null,
      repeatUntil: draft.repeatUntil || ""
    };
    var rp = remindPatch(draft.reminders);
    patch.reminders = rp.reminders;
    patch.remindAt = rp.remindAt;
    patch.remindLead = rp.remindLead;
    patch.progress = draft.progress || "شروع‌نشده";
    patch.status = stageStatus(patch.progress);
    if(patch.status === "done"){ if(t.status !== "done") patch.doneAt = todayISO(); }
    else patch.doneAt = {"__delete__":true};
    db.doc("tasks/" + t.id).update(patch).then(function(){
      btn.disabled=false; editingId=null; draft=null;
      note(""); rememberPerson(person); renderList();
    }, function(e){ btn.disabled=false; onWriteError(e); });
  }
  function saveCats(next){
    if(!guard()) return;
    db.doc("config/categories").set({areas:next}).then(function(){ note(""); }, onWriteError);
  }
  function saveCatsP(next){
    if(!guard()) return Promise.reject(new Error("no db"));
    return db.doc("config/categories").set({areas:next});
  }
  function cloneAreas(){ return JSON.parse(JSON.stringify(cats.areas||[])); }

  /* به‌روزرسانی پی‌درپی کارها، یکی‌یکی، با نمایش پیشرفت */
  function runSeq(items, fn, label, done){
    var i = 0;
    function step(){
      if(i >= items.length){ note(""); if(done) done(); return; }
      var it = items[i++];
      fn(it).then(function(){
        if(items.length > 3) note(label + " " + toFa(i) + " از " + toFa(items.length));
        setTimeout(step, 30);
      }, function(e){ onWriteError(e); });
    }
    step();
  }

  function countInArea(name){ return tasks.filter(function(t){ return (t.area||"") === name; }).length; }
  function countInSub(area, sub){
    return tasks.filter(function(t){ return (t.area||"") === area && (t.sub||"") === sub; }).length;
  }

  function addArea(name){
    var a = cloneAreas();
    if(a.some(function(x){ return x.name===name; })){ note("حوزه‌ای با این نام هست.", true); return; }
    a.push({name:name, subs:[]}); saveCats(a);
  }

  /* تغییر نام حوزه: هم در تنظیمات، هم روی همهٔ کارهای همان حوزه */
  function renameArea(idx, name){
    var a = cloneAreas();
    if(!a[idx]) return;
    var old = a[idx].name;
    if(old === name) return;
    if(a.some(function(x,i){ return i !== idx && x.name === name; })){
      note("حوزه‌ای با این نام هست.", true); renderCats(); return;
    }
    a[idx].name = name;
    var affected = tasks.filter(function(t){ return (t.area||"") === old; });
    if(filter.area === old) filter.area = name;
    saveCatsP(a).then(function(){
      if(!affected.length){ note(""); return; }
      runSeq(affected, function(t){ return db.doc("tasks/" + t.id).update({area: name}); },
        "انتقال کارها به نام تازه", null);
    }, onWriteError);
  }

  function removeArea(idx){
    var a = cloneAreas();
    if(!a[idx]) return;
    var old = a[idx].name;
    a.splice(idx,1);
    if(filter.area === old){ filter.area = "all"; filter.sub = "all"; }
    saveCats(a);
  }
  function moveArea(idx,delta){
    var a=cloneAreas(), j=idx+delta;
    if(j<0||j>=a.length) return;
    var tmp=a[idx]; a[idx]=a[j]; a[j]=tmp; saveCats(a);
  }

  function addSub(idx,name){
    var a=cloneAreas(); if(!a[idx]) return;
    a[idx].subs = a[idx].subs||[];
    if(a[idx].subs.indexOf(name)>=0){ note("زیردسته‌ای با این نام در این حوزه هست.", true); return; }
    a[idx].subs.push(name); saveCats(a);
  }

  /* تغییر نام زیردسته: هم در تنظیمات، هم روی کارهای همان زیردسته در همان حوزه */
  function renameSub(idx, si, name){
    var a = cloneAreas();
    if(!a[idx] || !a[idx].subs) return;
    var old = a[idx].subs[si], areaName = a[idx].name;
    if(old === name) return;
    if(a[idx].subs.some(function(s,k){ return k !== si && s === name; })){
      note("زیردسته‌ای با این نام در این حوزه هست.", true); renderCats(); return;
    }
    a[idx].subs[si] = name;
    var affected = tasks.filter(function(t){ return (t.area||"") === areaName && (t.sub||"") === old; });
    if(filter.sub === old) filter.sub = name;
    saveCatsP(a).then(function(){
      if(!affected.length){ note(""); return; }
      runSeq(affected, function(t){ return db.doc("tasks/" + t.id).update({sub: name}); },
        "انتقال کارها به نام تازه", null);
    }, onWriteError);
  }

  function removeSub(idx,si){
    var a=cloneAreas();
    if(!a[idx]||!a[idx].subs) return;
    var old = a[idx].subs[si];
    a[idx].subs.splice(si,1);
    if(filter.sub === old) filter.sub = "all";
    saveCats(a);
  }
  function moveSub(idx, si, delta){
    var a = cloneAreas();
    if(!a[idx] || !a[idx].subs) return;
    var j = si + delta;
    if(j < 0 || j >= a[idx].subs.length) return;
    var tmp = a[idx].subs[si]; a[idx].subs[si] = a[idx].subs[j]; a[idx].subs[j] = tmp;
    saveCats(a);
  }
  function addPerson(name){
    if(!guard()) return;
    if(people.indexOf(name)>=0) return;
    db.doc("config/people").set({names: people.concat([name])}).then(function(){ note(""); }, onWriteError);
  }
  function removePerson(name){
    if(!guard()) return;
    dropAcl(name);
    db.doc("config/people").set({names: people.filter(function(p){ return p!==name; })}).then(function(){ note(""); }, onWriteError);
  }

  /* ============ خروجی اکسل ============ */

  function csvCell(v){
    var s = (v===null||v===undefined) ? "" : String(v);
    if(/[",\n\r]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
    return s;
  }
  function buildCSV(rows){
    var head = ["اولویت امروز","شماره","پروژه","حوزه","زیردسته","کار","اولویت","شخص مربوط","وضعیت","پیشرفت",
                "حجم کار","وزن حجم","درصد پیشرفت","حجم باقی‌مانده",
                "مهلت (شمسی)","مهلت (میلادی)","یادآور (شمسی)","تکرار","تاریخ انجام (شمسی)","توضیحات","شناسه"];
    var lines = [head.map(csvCell).join(",")];
    rows.forEach(function(t){
      var r = remindDate(t);
      lines.push([
        rankOf(t) || "", t.num || "", t.project || "",
        t.area, t.sub, t.title, t.priority, t.person,
        (t.progress || "شروع‌نشده"),
        (PROG_LABEL[t.progress] || t.progress || ""),
        sizeOf(t), taskLoad(t), pctOf(t), Math.round(taskLeft(t)*10)/10,
        t.due ? fmtShort(t.due) : "", t.due || "",
        remindText(t), t.repeat || "",
        t.doneAt ? fmtShort(t.doneAt) : "", t.note, t.id
      ].map(csvCell).join(","));
    });
    return "﻿" + lines.join("\r\n") + "\r\n";
  }
  /* ===== خروجی اکسل بر اساس استاندارد بایگانی EAA =====
     قواعد اعمال‌شده: ستون A و سطر ۱ خالی، شروع محتوا از B2، هر ناحیه یک Table واقعی،
     شیت نخست «اطلاعات سند» با بلوک معرفی + جدول اطلاعات + ۱۰ سطر تاریخچه بازنگری،
     جهت شیت راست‌به‌چپ، فونت وزیر، ارقام فارسی، تاریخ سال/ماه/روز در ران LTR،
     و فهرست بسته برای ستون‌های با مقدار محدود.
     نام فایل: الگوی فایل کاری غیررسمی YYMMDD-Subject-CreatorX.xlsx */

  var EXCELJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
  var excelLoading = null;
  function loadExcelLib(){
    if(window.ExcelJS) return Promise.resolve(window.ExcelJS);
    if(excelLoading) return excelLoading;
    excelLoading = new Promise(function(res, rej){
      var s = document.createElement("script");
      s.src = EXCELJS_URL;
      s.async = true;
      s.onload = function(){ window.ExcelJS ? res(window.ExcelJS) : rej(new Error("lib missing")); };
      s.onerror = function(){ rej(new Error("load failed")); };
      document.head.appendChild(s);
      setTimeout(function(){ if(!window.ExcelJS) rej(new Error("timeout")); }, 20000);
    });
    return excelLoading;
  }

  var C_HEAD = "FF8EA9DB", C_L1 = "FFD9E1F2";
  function ltr(s){ return "‎" + String(s) + "‎"; }
  function exportName(ext){
    var j = isoToJ(todayISO());
    return pad2(j.jy % 100) + pad2(j.jm) + pad2(j.jd) + "-Tasks-EAA0." + ext;
  }

  function styleBlock(ws, top, left, nCols, nRows){
    var thin = {style:"thin", color:{argb:"FFB4C7E7"}};
    for(var i=0;i<=nRows;i++){
      for(var j=0;j<nCols;j++){
        var c = ws.getCell(top + i, left + j);
        c.border = {top:thin, left:thin, bottom:thin, right:thin};
        if(i === 0){
          c.font = {name:"Vazir", size:11, bold:true, color:{argb:"FFFFFFFF"}};
          c.fill = {type:"pattern", pattern:"solid", fgColor:{argb:C_HEAD}};
          c.alignment = {horizontal:"center", vertical:"middle", wrapText:true};
        } else {
          c.font = {name:"Vazir", size:10};
          c.alignment = {horizontal:"right", vertical:"middle", wrapText:true};
        }
      }
    }
    ws.getRow(top).height = 26;
  }

  function buildInfoSheet(wb, rows, scope){
    var ws = wb.addWorksheet("اطلاعات سند", {views:[{rightToLeft:true}]});
    ws.getColumn(1).width = 2.5;
    ws.getRow(1).height = 8;
    [[2,28],[3,54],[4,20],[5,18],[6,18],[7,18]].forEach(function(p){ ws.getColumn(p[0]).width = p[1]; });

    var title = "فهرست کارها — دفتر کارهای احسان";
    var tc = ws.getCell(2,2);
    tc.value = title;
    tc.font = {name:"Vazir", size:16, bold:true};
    tc.alignment = {horizontal:"right", vertical:"middle"};
    ws.mergeCells(2,2,2,5);
    ws.getRow(2).height = 30;

    var today = ltr(fmtShort(todayISO()));
    var intro = [
      "این فایل خروجی اپ «دفتر کارهای احسان» است و وضعیت کارها را در لحظهٔ استخراج نشان می‌دهد.",
      "دامنهٔ استخراج: " + scope + " — در مجموع " + toFa(rows.length) + " کار.",
      "این یک فایل کاری شخصی است و کد موضوعی بایگانی ندارد؛ مرجع به‌روز، خود اپ است."
    ];
    var r = 4;
    intro.forEach(function(line){
      var c = ws.getCell(r,2);
      c.value = line;
      c.font = {name:"Vazir", size:11};
      c.alignment = {horizontal:"right", vertical:"middle", wrapText:true};
      ws.mergeCells(r,2,r,5);
      ws.getRow(r).height = 32;
      r++;
    });
    r += 1;

    var infoRows = [
      ["دسته‌بندی", "فایل کاری — فهرست کارها"],
      ["شماره سند", "بدون کد موضوعی (فایل کاری غیررسمی)"],
      ["موضوع سند", title],
      ["واحد مالک", "شخصی"],
      ["تاریخ ایجاد", today],
      ["نسخه فعلی", "EAA0"],
      ["محل بایگانی", "فضای کاری شخصی — وارد بایگانی نمی‌شود"]
    ];
    ws.addTable({
      name:"TasksInfo", ref:"B" + r, headerRow:true,
      style:{theme:"TableStyleLight9", showRowStripes:true},
      columns:[{name:"عنوان"},{name:"مقدار"}],
      rows: infoRows
    });
    styleBlock(ws, r, 2, 2, infoRows.length);
    r += infoRows.length + 3;

    var revRows = [[toFa(1), today, "EAA", "ایجاد نسخه اولیه", "", today]];
    for(var i=2;i<=10;i++) revRows.push([toFa(i), "", "", "", "", ""]);
    ws.addTable({
      name:"TasksRev", ref:"B" + r, headerRow:true,
      style:{theme:"TableStyleLight9", showRowStripes:true},
      columns:[{name:"ردیف"},{name:"تاریخ ویرایش"},{name:"ویرایش‌کننده"},
               {name:"موارد ویرایش"},{name:"ارجاع‌شونده"},{name:"تاریخ ارجاع"}],
      rows: revRows
    });
    styleBlock(ws, r, 2, 6, revRows.length);
    [[2,8],[3,16],[4,16],[5,40],[6,16],[7,16]].forEach(function(p){ ws.getColumn(p[0]).width = p[1]; });
    return ws;
  }

  function buildTasksSheet(wb, rows){
    var ws = wb.addWorksheet("فهرست کارها", {views:[{rightToLeft:true, state:"frozen", ySplit:2}]});
    ws.getColumn(1).width = 2.5;
    ws.getRow(1).height = 8;

    var cols = [
      {name:"ردیف", w:7},
      {name:"اولویت امروز", w:12},
      {name:"شماره", w:9},
      {name:"پروژه", w:18},
      {name:"حوزه", w:20},
      {name:"زیردسته", w:24},
      {name:"کار", w:42},
      {name:"اولویت", w:10},
      {name:"شخص مربوط", w:16},
      {name:"وضعیت", w:12},
      {name:"پیشرفت", w:14},
      {name:"حجم کار", w:12},
      {name:"درصد پیشرفت", w:12},
      {name:"حجم باقی‌مانده", w:14},
      {name:"مهلت", w:14},
      {name:"یادآور", w:14},
      {name:"تکرار", w:10},
      {name:"تاریخ انجام", w:14},
      {name:"توضیحات", w:52},
      {name:"شناسه", w:22}
    ];
    cols.forEach(function(c, i){ ws.getColumn(2 + i).width = c.w; });

    var data = rows.map(function(t, i){
      var rd = remindDate(t);
      return [
        toFa(i + 1),
        rankOf(t) ? toFa(rankOf(t)) : "",
        t.num ? toFa(t.num) : "",
        t.project || "",
        t.area || "",
        t.sub || "",
        t.title || "",
        t.priority || "",
        t.person || "",
        (t.progress || "شروع‌نشده"),
        (PROG_LABEL[t.progress] || t.progress || ""),
        sizeOf(t),
        toFa(pctOf(t)) + "٪",
        fmtW(taskLeft(t)),
        t.due ? ltr(fmtShort(t.due)) : "",
        remindText(t),
        t.repeat || "",
        t.doneAt ? ltr(fmtShort(t.doneAt)) : "",
        t.note || "",
        t.id || ""
      ];
    });

    ws.addTable({
      name:"TasksList", ref:"B2", headerRow:true,
      style:{theme:"TableStyleLight9", showRowStripes:true},
      columns: cols.map(function(c){ return {name:c.name}; }),
      rows: data
    });
    styleBlock(ws, 2, 2, cols.length, data.length);

    /* فهرست بسته برای ستون‌های با مقدار محدود — تا ۲۰۰ سطر بعد از داده‌ها */
    var lists = {
      9:  PRIOS,                                  /* I — اولویت */
      11: ["شروع‌نشده","در حال انجام","منتظر بررسی","تأیید","انجام‌شده"],  /* K — وضعیت/مرحله */
      12: ["شروع‌نشده","در حال انجام","منتظر بررسی","تأیید","انجام‌شده"], /* L — مرحله */
      13: SIZE_NAMES,                             /* M — حجم کار */
      18: ["هفتگی","ماهانه","فصلی","سالانه"],       /* R — تکرار */
      6:  areaNames()                             /* F — حوزه */
    };
    var last = 2 + Math.max(data.length, 1) + 200;
    Object.keys(lists).forEach(function(colIdx){
      var items = lists[colIdx].filter(function(s){ return s && s.indexOf(",") < 0; });
      if(!items.length) return;
      var f = '"' + items.join(",") + '"';
      if(f.length > 255) return;
      for(var rr = 3; rr <= last; rr++){
        ws.getCell(rr, Number(colIdx)).dataValidation = {
          type:"list", allowBlank:true, formulae:[f], showErrorMessage:true,
          errorTitle:"مقدار نامعتبر", error:"از فهرست کشویی انتخاب کنید."
        };
      }
    });
    return ws;
  }

  function scopeLabel(){
    var bits = [];
    bits.push(filter.status === "open" ? "کارهای باز" : filter.status === "done" ? "کارهای انجام‌شده" : "همهٔ کارها");
    if(filter.area !== "all") bits.push("حوزهٔ " + filter.area);
    if(filter.sub !== "all") bits.push("زیردستهٔ " + filter.sub);
    if(filter.prio !== "all") bits.push("اولویت " + filter.prio);
    if(filter.person !== "all") bits.push("شخص " + filter.person);
    if(filter.prog !== "all") bits.push("پیشرفت " + filter.prog);
    if(filter.q) bits.push("جستجوی «" + filter.q + "»");
    return bits.join("، ");
  }

  function exportCSV(btn){
    if(!downloads){ note("خروجی در این نمایش ممکن نیست.", true); return; }
    var rows = tasks.filter(visible).sort(sortNow);
    if(!rows.length){ note("این فهرست خالی است؛ چیزی برای خروجی نیست.", true); return; }
    btn.disabled = true;
    note("در حال ساختن فایل اکسل…");

    loadExcelLib().then(function(ExcelJS){
      var wb = new ExcelJS.Workbook();
      wb.creator = "EAA";
      wb.created = new Date();
      buildInfoSheet(wb, rows, scopeLabel());
      buildTasksSheet(wb, rows);
      return wb.xlsx.writeBuffer();
    }).then(function(buf){
      return downloads.save({filename: exportName("xlsx"), data: buf});
    }).then(function(){
      btn.disabled = false; note("");
    }).catch(function(e){
      btn.disabled = false;
      if(e && e.code === "declined"){ note(""); return; }
      /* اگر کتابخانهٔ اکسل بالا نیامد، نسخهٔ CSV را بده و صریح بگو */
      downloads.save({filename: exportName("csv"), data: buildCSV(rows)}).then(function(){
        note("ساخت فایل xlsx ممکن نشد؛ خروجی CSV گرفته شد (اکسل بازش می‌کند، ولی قالب استاندارد را ندارد).", true);
      }, function(e2){
        if(e2 && e2.code === "declined") note("");
        else note("ذخیره فایل انجام نشد.", true);
      });
    });
  }


  /* ============ ورودی اکسل ============ */
  /* همان فایلی را می‌خواند که خروجی داده است: ستون «شناسه» می‌گوید کدام سطر
     کدام کار است. سطر بی‌شناسه، کار تازه حساب می‌شود. */

  var IMP_MAP = {
    "اولویت امروز":"rank", "شماره":"num", "پروژه":"project",
    "حوزه":"area", "زیردسته":"sub", "کار":"title", "اولویت":"priority",
    "شخص مربوط":"person", "شخص":"person", "وضعیت":"status", "پیشرفت":"progress",
    "حجم کار":"size", "حجم":"size", "درصد پیشرفت":"pct",
    "مهلت (شمسی)":"due", "مهلت":"due", "مهلت (میلادی)":"dueISO",
    "یادآور (شمسی)":"remindAt", "یادآور":"remindAt",
    "تکرار":"repeat", "تاریخ انجام (شمسی)":"doneAt", "تاریخ انجام":"doneAt",
    "توضیحات":"note", "شناسه":"id"
  };
  var IMP_SKIP = {"ردیف":1, "وزن حجم":1, "حجم باقی‌مانده":1, "مهلت (میلادی)":1};

  function cleanCell(v){
    if(v === null || v === undefined) return "";
    if(typeof v === "object"){
      if(v.text !== undefined) return String(v.text);
      if(v.result !== undefined) return String(v.result);
      if(v.richText) return v.richText.map(function(r){ return r.text; }).join("");
      return "";
    }
    /* نشانه‌های جهت‌نما که در خروجی به تاریخ‌ها اضافه شده‌اند */
    return String(v).replace(/[‎‏]/g, "").trim();
  }

  function jToISO(raw){
    var t = cleanCell(raw);
    if(!t) return "";
    var r = parseJInput(t);
    return (r && r.ok) ? r.iso : "";
  }
  function pctFromCell(raw){
    var t = toLatinDigits(cleanCell(raw)).replace(/[^0-9.]/g, "");
    if(t === "") return null;
    var n = Number(t);
    if(!isFinite(n)) return null;
    if(n > 0 && n <= 1) n = n * 100;            /* اکسل درصد را ۰٫۴ می‌دهد */
    return Math.max(0, Math.min(100, Math.round(n/5)*5));
  }

  /* یک سطر خام → شیء کار، فقط فیلدهای شناخته‌شده */
  function rowToTask(obj){
    var t = {};
    if(obj.title !== undefined) t.title = cleanCell(obj.title);
    if(obj.area !== undefined) t.area = cleanCell(obj.area);
    if(obj.sub !== undefined) t.sub = cleanCell(obj.sub);
    if(obj.person !== undefined) t.person = cleanCell(obj.person);
    if(obj.project !== undefined) t.project = cleanCell(obj.project);
    if(obj.num !== undefined){
      var nn = parseInt(toLatinDigits(cleanCell(obj.num)).replace(/[^0-9]/g, ""), 10);
      if(isFinite(nn) && nn > 0) t.num = nn;
    }
    if(obj.rank !== undefined){
      var rr = parseInt(toLatinDigits(cleanCell(obj.rank)).replace(/[^0-9]/g, ""), 10);
      if(isFinite(rr) && rr > 0){ t.rank = rr; t.rankDate = todayISO(); }
      else { t.rank = 0; t.rankDate = ""; }
    }
    if(obj.note !== undefined) t.note = cleanCell(obj.note);
    if(obj.priority !== undefined){
      var p = cleanCell(obj.priority);
      t.priority = PRIOS.indexOf(p) >= 0 ? p : "متوسط";
    }
    if(obj.size !== undefined){
      var z = cleanCell(obj.size);
      t.size = SIZE_NAMES.indexOf(z) >= 0 ? z : "متوسط";
    }
    if(obj.repeat !== undefined){
      var rp = cleanCell(obj.repeat);
      t.repeat = ["هفتگی","ماهانه","فصلی","سالانه"].indexOf(rp) >= 0 ? rp : "";
    }
    if(obj.due !== undefined) t.due = jToISO(obj.due);
    if(obj.remindAt !== undefined){
      /* خروجی می‌تواند چند یادآور را با ؛ در یک خانه بنویسد؛ آن حالت قابل برگشت نیست
         و دست‌نخورده رها می‌شود تا یادآورهای موجود پاک نشوند */
      var rtxt = cleanCell(obj.remindAt);
      if(rtxt.indexOf("؛") < 0){
        var only = rtxt.replace(/[۰-۹0-9]{1,2}:[۰-۹0-9]{2}/, "").trim();
        var riso = only ? jToISO(only) : "";
        if(riso){
          var rt = okTime((/([۰-۹0-9]{1,2}:[۰-۹0-9]{2})/.exec(rtxt) || [])[1] || DEF_TIME) || DEF_TIME;
          t.reminders = [{lead: null, at: riso, time: rt}];
          t.remindAt = riso;
          t.remindLead = "";
        } else if(!rtxt){
          t.reminders = [];
          t.remindAt = "";
          t.remindLead = "";
        }
      }
    }
    if(obj.doneAt !== undefined) t.doneAt = jToISO(obj.doneAt);
    if(obj.pct !== undefined){
      var pc = pctFromCell(obj.pct);
      if(pc !== null) t.pct = pc;
    }
    var st = cleanCell(obj.status), pg = cleanCell(obj.progress);
    if(st || pg){
      var done = (st === "انجام‌شده" || st === "انجام شد" || pg === "انجام‌شده" || pg === "انجام شد");
      t.status = done ? "done" : "open";
      if(done){
        t.progress = "انجام‌شده";
        t.pct = 100;
        if(!t.doneAt) t.doneAt = todayISO();
      } else {
        var stg = normStage({progress: pg, status: st});
        t.progress = stg;
        t.status = stageStatus(stg);
        if(stg === DONE_STAGE){ t.pct = 100; if(!t.doneAt) t.doneAt = todayISO(); }
      }
    }
    return t;
  }

  function readSheetRows(ws){
    var rows = [], head = null, headRow = -1;
    ws.eachRow(function(row, n){
      var vals = [];
      row.eachCell({includeEmpty:true}, function(cell, c){ vals[c] = cleanCell(cell.value); });
      var txt = vals.join("|");
      if(head === null){
        if(txt.indexOf("کار") >= 0 && txt.indexOf("حوزه") >= 0){
          head = vals; headRow = n;
        }
        return;
      }
      if(n <= headRow) return;
      var empty = true;
      for(var i = 0; i < vals.length; i++){ if(vals[i]) { empty = false; break; } }
      if(empty) return;
      var obj = {};
      for(var c = 0; c < head.length; c++){
        var h = head[c];
        if(!h || IMP_SKIP[h]) continue;
        var key = IMP_MAP[h];
        if(key) obj[key] = vals[c];
      }
      rows.push(obj);
    });
    return rows;
  }

  function parseCSVText(text){
    var out = [], row = [], cell = "", q = false, i;
    text = text.replace(/^﻿/, "");
    for(i = 0; i < text.length; i++){
      var ch = text[i];
      if(q){
        if(ch === '"'){
          if(text[i+1] === '"'){ cell += '"'; i++; }
          else q = false;
        } else cell += ch;
      } else if(ch === '"'){ q = true; }
      else if(ch === ','){ row.push(cell); cell = ""; }
      else if(ch === '\n'){ row.push(cell); out.push(row); row = []; cell = ""; }
      else if(ch !== '\r'){ cell += ch; }
    }
    if(cell !== "" || row.length){ row.push(cell); out.push(row); }

    var head = null, rows = [];
    out.forEach(function(vals){
      if(head === null){
        if(vals.join("|").indexOf("کار") >= 0){ head = vals; }
        return;
      }
      if(!vals.join("")) return;
      var obj = {};
      for(var c = 0; c < head.length; c++){
        var h = (head[c] || "").trim();
        if(!h || IMP_SKIP[h]) continue;
        var key = IMP_MAP[h];
        if(key) obj[key] = vals[c];
      }
      rows.push(obj);
    });
    return rows;
  }

  /* مقایسه با وضعیت فعلی: چه چیزی تازه است، چه چیزی عوض شده */
  function planImport(rows){
    var byId = {};
    tasks.forEach(function(t){ byId[t.id] = t; });
    var plan = {creates:[], updates:[], same:0, bad:0};

    rows.forEach(function(obj){
      var id = cleanCell(obj.id);
      var t = rowToTask(obj);
      if(!t.title){ plan.bad++; return; }
      var cur = id ? byId[id] : null;
      if(!cur){
        t.progress = t.progress || "شروع‌نشده";
        t.status = stageStatus(t.progress);
        if(t.pct === undefined) t.pct = 0;
        if(!t.num) t.num = nextNum() + plan.creates.length;
        t.createdAt = new Date().toISOString();
        plan.creates.push(t);
        return;
      }
      var diff = {}, fields = ["title","area","sub","person","project","priority","size","rank",
                               "pct","progress","status","doneAt","due","remindAt",
                               "repeat","note"];
      fields.forEach(function(f){
        if(t[f] === undefined) return;
        var a = t[f], b = cur[f];
        if(f === "pct") { a = Number(a); b = Number(b); }
        if(String(a) !== String(b === undefined ? "" : b)) diff[f] = t[f];
      });
      if(Object.keys(diff).length) plan.updates.push({id:id, diff:diff, title:cur.title});
      else plan.same++;
    });
    return plan;
  }

  function askImport(plan){
    var box = $("status");
    box.innerHTML = "";
    var d = document.createElement("div");
    d.className = "msg alert";
    var bits = [];
    if(plan.creates.length) bits.push(toFa(plan.creates.length) + " کار تازه");
    if(plan.updates.length) bits.push(toFa(plan.updates.length) + " کار تغییریافته");
    if(plan.same) bits.push(toFa(plan.same) + " بدون تغییر");
    if(plan.bad) bits.push(toFa(plan.bad) + " سطر بی‌عنوان (رد می‌شود)");
    var p = document.createElement("div");
    p.textContent = "از این فایل خوانده شد: " + bits.join("، ") + ".";
    d.appendChild(p);

    if(plan.updates.length){
      var ul = document.createElement("div");
      ul.className = "sub";
      ul.style.marginTop = "6px";
      ul.textContent = "تغییرها: " + plan.updates.slice(0, 6).map(function(u){
        return u.title + " (" + Object.keys(u.diff).length + " فیلد)";
      }).join(" · ") + (plan.updates.length > 6 ? " … " : "");
      d.appendChild(ul);
    }

    var row = document.createElement("div");
    row.className = "row";
    row.style.marginTop = "8px";
    var ok = document.createElement("button");
    ok.type = "button"; ok.className = "primary"; ok.textContent = "اعمال کن";
    var no = document.createElement("button");
    no.type = "button"; no.textContent = "انصراف";
    no.addEventListener("click", function(){ note(""); });
    ok.addEventListener("click", function(){
      ok.disabled = true; no.disabled = true;
      applyImport(plan);
    });
    row.appendChild(ok); row.appendChild(no);
    d.appendChild(row);
    box.appendChild(d);
  }

  function applyImport(plan){
    var ops = [];
    plan.creates.forEach(function(t){
      var id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
      ops.push({op:"set", path:"tasks/" + id, data:t});
    });
    plan.updates.forEach(function(u){
      ops.push({op:"update", path:"tasks/" + u.id, data:u.diff});
    });
    if(!ops.length){ note("چیزی برای اعمال نبود."); return; }
    note("در حال اعمال " + toFa(ops.length) + " تغییر…");
    db.batch(ops).then(function(){
      note("انجام شد: " + toFa(plan.creates.length) + " کار تازه، "
           + toFa(plan.updates.length) + " به‌روزرسانی.");
    }, function(e){
      note("اعمال ورودی انجام نشد: " + (e && e.message ? e.message : ""), true);
    });
  }

  function importFile(file){
    if(!file) return;
    var isCSV = /\.csv$/i.test(file.name);
    note("در حال خواندن " + file.name + "…");
    var fr = new FileReader();
    fr.onerror = function(){ note("خواندن فایل انجام نشد.", true); };
    fr.onload = function(){
      try {
        if(isCSV){
          var plan = planImport(parseCSVText(String(fr.result)));
          askImport(plan);
          return;
        }
        loadExcelLib().then(function(ExcelJS){
          var wb = new ExcelJS.Workbook();
          return wb.xlsx.load(fr.result).then(function(){
            var ws = wb.getWorksheet("فهرست کارها");
            if(!ws){
              wb.eachSheet(function(sh){
                if(!ws && sh.name.indexOf("اطلاعات") < 0) ws = sh;
              });
            }
            if(!ws) throw new Error("شیت کارها پیدا نشد.");
            var rows = readSheetRows(ws);
            if(!rows.length) throw new Error("سطری خوانده نشد؛ سرستون‌ها را عوض نکنید.");
            askImport(planImport(rows));
          });
        }).catch(function(e){
          note("خواندن فایل اکسل انجام نشد: " + (e && e.message ? e.message : ""), true);
        });
      } catch(e){
        note("فایل خوانده نشد: " + (e && e.message ? e.message : ""), true);
      }
    };
    if(isCSV) fr.readAsText(file, "utf-8");
    else fr.readAsArrayBuffer(file);
  }

  /* ============ رویدادها ============ */

  addDue = makeJDate({ariaLabel:"مهلت", placeholder:"مهلت: ۱۴۰۵/۹/۱"});
  $("f-due-slot").appendChild(addDue.el);

  function openAddExtras(){
    /* حوزه و زیردسته را روی دسته‌ای که باز است بگذار */
    if(filter.area !== "all" && areaNames().indexOf(filter.area) >= 0){
      $("f-area").value = filter.area;
      fillSelect($("f-sub"), subsOf(filter.area), "— بدون زیردسته —", filter.sub !== "all" ? filter.sub : "");
    }
    if(addDue) addDue.set(todayISO());
    $("f-title").focus();
  }
  function setAddOpen(open){
    if(open) openToolPanel("addpanel");
    else closeToolPanels(null);
  }
  $("addclose").addEventListener("click", function(){ setAddOpen(false); });

  $("addform").addEventListener("submit", function(ev){
    ev.preventDefault();
    var title = $("f-title").value.trim();
    if(!title) return;
    var dr = addDue.get();
    if(!dr.ok){ note("مهلت نامعتبر است.", true); return; }
    var lead = $("f-remind").value;
    if(lead !== "" && !dr.iso){ note("برای یادآور نسبت به مهلت، اول مهلت را بنویسید.", true); return; }
    addTask({
      title:title,
      area: $("f-area").value || "",
      sub: $("f-sub").value || "",
      due: dr.iso,
      priority: $("f-prio").value || "متوسط",
      person: $("f-person").value.trim(),
      project: $("f-project").value.trim(),
      num: nextNum(),
      size: $("f-size").value || "متوسط",
      pct: Number($("f-pct").value) || 0,
      progress: (Number($("f-pct").value) > 0 && ($("f-prog").value || "شروع‌نشده") === "شروع‌نشده") ? "در حال انجام" : ($("f-prog").value || "شروع‌نشده"),
      remindLead: lead, remindAt: "",
      reminders: (lead === "" ? [] : [{lead: Number(lead), at: "", time: DEF_TIME}]),
      repeat: $("f-repeat").value || "",
      status: stageStatus($("f-prog").value || "شروع‌نشده"),
      doneAt: ($("f-prog").value === DONE_STAGE ? todayISO() : ""),
      note: ($("f-note").value || "").trim(),
      createdAt: new Date().toISOString()
    });
    $("f-title").value=""; $("f-person").value=""; $("f-project").value="";
    addDue.set(todayISO());
    $("f-remind").value=""; $("f-repeat").value="";
    $("f-prog").value="شروع‌نشده"; $("f-pct").value="0"; $("f-note").value="";
    $("f-title").focus();
  });

  $("f-area").addEventListener("change", function(){
    fillSelect($("f-sub"), subsOf($("f-area").value), "— بدون زیردسته —", "");
  });
  $("addarea").addEventListener("submit", function(ev){
    ev.preventDefault();
    var v = $("f-newarea").value.trim(); if(!v) return;
    $("f-newarea").value=""; addArea(v);
  });
  $("addperson").addEventListener("submit", function(ev){
    ev.preventDefault();
    var v = $("f-newperson").value.trim(); if(!v) return;
    $("f-newperson").value=""; addPerson(v);
  });

  Array.prototype.forEach.call(document.querySelectorAll(".chip[data-st]"), function(btn){
    btn.addEventListener("click", function(){
      filter.status = btn.getAttribute("data-st");
      Array.prototype.forEach.call(document.querySelectorAll(".chip[data-st]"), function(b){
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      renderTabs(); renderList();
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".chip[data-tab]"), function(btn){
    btn.addEventListener("click", function(){
      filter.tab = btn.getAttribute("data-tab");
      Array.prototype.forEach.call(document.querySelectorAll(".chip[data-tab]"), function(b){
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      renderTabs(); renderList();
    });
  });
  function setBoardGroup(g){
    boardGroup = g;
    var a = $("bg-sub"), b = $("bg-stage");
    if(a) a.setAttribute("aria-pressed", g === "sub" ? "true" : "false");
    if(b) b.setAttribute("aria-pressed", g === "stage" ? "true" : "false");
    renderList();
  }
  if($("bg-sub")) $("bg-sub").addEventListener("click", function(){ setBoardGroup("sub"); });
  if($("bg-stage")) $("bg-stage").addEventListener("click", function(){ setBoardGroup("stage"); });
  if($("opt-done")) $("opt-done").addEventListener("change", function(){
    filter.status = this.checked ? "all" : "open";
    renderTabs(); renderList();
  });
  $("x-search").addEventListener("input", function(){ filter.q = this.value.trim(); renderTabs(); renderList(); });
  $("x-export").addEventListener("click", function(){ exportCSV(this); });
  confirmable($("x-rankclear"), "مطمئنید؟", clearRanksToday);
  $("x-import").addEventListener("click", function(){ $("x-file").click(); });
  $("x-file").addEventListener("change", function(){
    var f = this.files && this.files[0];
    this.value = "";
    importFile(f);
  });
  $("v-board").addEventListener("click", function(){ setView("board"); });
  $("v-list").addEventListener("click", function(){ setView("list"); });
  $("v-rows").addEventListener("click", function(){ setView("rows"); });
  fillPairs($("x-sort"), SORTS.map(function(s){ return {v:s[0], l:"چیدمان: " + s[1]}; }), sortKey);
  $("x-sort").addEventListener("change", function(){ setSort(this.value); });
  $("x-sortdir").addEventListener("click", flipSort);
  syncSortUI();
  $("v-panel").addEventListener("click", function(){
    panelHidden = !panelHidden;
    try { localStorage.setItem("panel", panelHidden ? "off" : "on"); } catch(e){}
    $("v-panel").setAttribute("aria-pressed", panelHidden ? "false" : "true");
    renderToday();
  });
  $("v-panel").setAttribute("aria-pressed", panelHidden ? "false" : "true");
  // ----- پنل‌های بالای صفحه: کار تازه / تنظیمات داشبورد / دسته‌ها / دسترسی‌ها / راهنما -----
  var TOOLPANELS = [
    ["addtoggle","addpanel", openAddExtras],
    ["btn-dash","dashpanel", null],
    ["btn-cats","catspanel", function(){ renderCats(); renderPeople(); }],
    ["btn-access","accesspanel", function(){ renderAcl(); }],
    ["btn-help","helppanel", null]
  ];
  (function(){
    var az = $("addzone");
    TOOLPANELS.forEach(function(p){ var el=$(p[1]); if(el && az && el.parentNode !== az) az.appendChild(el); });
  })();
  function closeToolPanels(except){
    TOOLPANELS.forEach(function(p){
      var el = $(p[1]), btn = $(p[0]);
      var on = (p[1] === except);
      if(el) el.hidden = !on;
      if(btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }
  function openToolPanel(pid){
    var onOpen = null;
    TOOLPANELS.forEach(function(p){ if(p[1] === pid) onOpen = p[2]; });
    closeToolPanels(pid);
    if(onOpen) onOpen();
    var el = $(pid);
    if(el && el.scrollIntoView) setTimeout(function(){ el.scrollIntoView({behavior:"smooth", block:"nearest"}); }, 20);
  }
  TOOLPANELS.forEach(function(p){
    var btn = $(p[0]); if(!btn) return;
    btn.addEventListener("click", function(){
      var el = $(p[1]); if(!el) return;
      if(el.hidden) openToolPanel(p[1]);
      else closeToolPanels(null);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll(".pclose"), function(b){
    b.addEventListener("click", function(){ closeToolPanels(null); });
  });
  /* تاریخ که عوض شود، «امروز» هم باید عوض شود */
  setInterval(function(){ try { renderToday(); } catch(e){} }, 60000);

  /* انتخاب تم: روشن، تیره، یا مانند دستگاه */
  var THEMES = ["auto","light","dark"];
  var theme = "auto";
  try { var ts = localStorage.getItem("theme"); if(THEMES.indexOf(ts) >= 0) theme = ts; } catch(e){}
  function applyTheme(){
    var root = document.documentElement;
    if(theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    THEMES.forEach(function(k){
      var b = $("t-" + k);
      if(b) b.setAttribute("aria-pressed", theme === k ? "true" : "false");
    });
    try { localStorage.setItem("theme", theme); } catch(e){}
  }
  THEMES.forEach(function(k){
    var b = $("t-" + k);
    if(b) b.addEventListener("click", function(){ theme = k; applyTheme(); });
  });
  /* اگر میزبان بعداً تم خودش را روی صفحه بگذارد، انتخاب شما حفظ می‌شود */
  try {
    new MutationObserver(function(){
      if(theme === "auto") return;
      if(document.documentElement.getAttribute("data-theme") !== theme){
        document.documentElement.setAttribute("data-theme", theme);
      }
    }).observe(document.documentElement, {attributes:true, attributeFilter:["data-theme"]});
  } catch(e){}
  applyTheme();

  var ZOOMS = [0.55,0.65,0.75,0.85,1,1.15,1.3];
  var zi = 4;
  try {
    var saved = parseFloat(localStorage.getItem("zoom"));
    var k = ZOOMS.indexOf(saved);
    if(k >= 0) zi = k;
  } catch(e){}
  /* تخته تمام عرض مانیتور را می‌گیرد؛ نمای فهرست برای خوانایی سطرها سقف دارد */
  function applyWidth(){
    document.documentElement.style.setProperty("--maxw",
      VIEW === "board" ? "4000px" : (VIEW === "rows" ? "2400px" : "1500px"));
  }
  function applyZoom(){
    applyWidth();
    var z = ZOOMS[zi];
    document.documentElement.style.setProperty("--z", String(z));
    $("z-val").textContent = toFa(Math.round(z*100)) + "٪";
    $("z-out").disabled = (zi === 0);
    $("z-in").disabled = (zi === ZOOMS.length - 1);
    try { localStorage.setItem("zoom", String(z)); } catch(e){}
    updateArrows();
    try { renderToday(); } catch(e){}
  }
  $("z-out").addEventListener("click", function(){ if(zi > 0){ zi--; applyZoom(); } });
  $("z-in").addEventListener("click", function(){ if(zi < ZOOMS.length-1){ zi++; applyZoom(); } });
  $("z-val").addEventListener("click", function(){ zi = 4; applyZoom(); });
  applyZoom();
  wireArrows("areatabs","area-prev","area-next");
  wireArrows("subtabs","sub-prev","sub-next");
  window.addEventListener("resize", updateArrows);
  window.addEventListener("resize", function(){ renderToday(); });

  /* ============ راه‌اندازی ============ */

  $("v-board").setAttribute("aria-pressed", VIEW === "board" ? "true" : "false");
  $("v-list").setAttribute("aria-pressed", VIEW === "list" ? "true" : "false");
  $("v-rows").setAttribute("aria-pressed", VIEW === "rows" ? "true" : "false");
  renderAll();
  note("در حال اتصال…");
  loadTimer = setTimeout(function(){
    note("داده‌ها هنوز نرسیده‌اند؛ چیزی که می‌بینید ممکن است به‌روز نباشد.", true);
  }, 10000);
  function clearLoading(){
    if(loadTimer){ clearTimeout(loadTimer); loadTimer=null; }
    note("");
  }

  /* ============ اتصال به سرور ============ */

  downloads = {
    save: function(o){
      return new Promise(function(res){
        var blob = (typeof o.data === "string")
          ? new Blob(["﻿" + o.data], {type:"text/csv;charset=utf-8"})
          : new Blob([o.data], {type:"application/octet-stream"});
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = o.filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){ URL.revokeObjectURL(a.href); a.parentNode.removeChild(a); res(); }, 200);
      });
    }
  };
  $("x-export").hidden = false;

  function apiGet(url){
    return fetch(url, {credentials:"same-origin"}).then(function(r){
      if(r.status === 401 || r.status === 403) throw new Error("unauthorized");
      if(!r.ok) throw new Error("http " + r.status);
      return r.json();
    });
  }
  function apiWrite(ops){
    return fetch("api/write", {
      method:"POST", credentials:"same-origin",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ops: ops})
    }).then(function(r){
      return r.json().then(function(j){
        if(!r.ok) throw new Error((j && j.error) ? j.error : ("http " + r.status));
        return j;
      }, function(){ throw new Error("http " + r.status); });
    });
  }

  function RestDB(){
    var ver = 0, docSubs = {}, colSubs = [], cur = {tasks:[], config:{}};
    var self = this;

    function fireDoc(path, cb, cached){
      var key = path.split("/")[1];
      var d = cur.config[key];
      cb({exists: !!d, data: function(){ return d || {}; },
          metadata:{fromCache: !!cached}});
    }
    function fireAll(){
      colSubs.forEach(function(cb){
        cb({docs: cur.tasks.map(function(t){
              return {id: t.id, data: function(){ return t; }};
            }),
            metadata:{fromCache:false}});
      });
      Object.keys(docSubs).forEach(function(path){
        docSubs[path].forEach(function(cb){ fireDoc(path, cb, false); });
      });
    }
    function apply(st){
      ver = st.version || 0;
      if(st.me){ ME = st.me; applyRole(); }
      cur = {tasks: st.tasks || [], config: st.config || {}};
      fireAll();
    }
    function refresh(){ return apiGet("api/state?since=0").then(apply); }
    function poll(){
      apiGet("api/state?since=" + ver).then(function(st){
        if(st.unchanged) ver = st.version || ver;
        else apply(st);
        setTimeout(poll, 120);
      }, function(e){
        if(String(e.message) === "unauthorized"){
          writable = false;
          note("این لینک معتبر نیست. لینک شخصی خودتان را باز کنید.", true);
          return;
        }
        note("ارتباط با سرور قطع شده؛ دوباره تلاش می‌کنم.", true);
        setTimeout(poll, 4000);
      });
    }

    self.start = function(){ return refresh().then(function(){ poll(); }); };
    self.doc = function(path){
      return {
        set:    function(d){ return apiWrite([{op:"set",    path:path, data:d}]).then(refresh); },
        update: function(d){ return apiWrite([{op:"update", path:path, data:d}]).then(refresh); },
        "delete": function(){ return apiWrite([{op:"delete", path:path}]).then(refresh); },
        onSnapshot: function(cb){
          (docSubs[path] = docSubs[path] || []).push(cb);
          fireDoc(path, cb, true);
        }
      };
    };
    self.batch = function(ops){
      var i = 0, chunks = [];
      for(i = 0; i < ops.length; i += 50) chunks.push(ops.slice(i, i + 50));
      return chunks.reduce(function(pr, c){
        return pr.then(function(){ return apiWrite(c); });
      }, Promise.resolve()).then(refresh);
    };
    self.collection = function(){
      return {
        add: function(d){
          var id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
          return apiWrite([{op:"set", path:"tasks/" + id, data:d}]).then(refresh);
        },
        onSnapshot: function(cb){ colSubs.push(cb); }
      };
    };
  }

  db = new RestDB();

  db.doc("config/categories").onSnapshot(function(snap){
    if(snap.exists){
      var d = snap.data();
      if(d && Array.isArray(d.areas)) cats = {areas:d.areas};
    }
    if(!snap.metadata.fromCache && tasksLoaded) clearLoading();
    renderAll();
  });

  db.doc("config/people").onSnapshot(function(snap){
    if(snap.exists){
      var d = snap.data();
      if(d && Array.isArray(d.names)) people = d.names.slice();
    }
    renderPickers(); renderPeople(); renderAcl();
  });

  db.doc("config/access").onSnapshot(function(snap){
    if(snap.exists){
      var d = snap.data();
      if(d && d.roles && typeof d.roles === "object") acl = d.roles;
    }
    renderAcl();
  });

  db.collection("tasks").onSnapshot(function(snap){
    var next = snap.docs.map(function(d){
      var o = d.data() || {};
      var stg = normStage(o);
      return {
        id:d.id,
        title:o.title||"", area:o.area||"", sub:o.sub||"", due:o.due||"",
        priority: PRIOS.indexOf(o.priority)>=0 ? o.priority : "متوسط",
        person:o.person||"", progress: stg,
        num: (function(v){ var n = parseInt(v, 10); return isFinite(n) && n > 0 ? n : 0; })(o.num),
        rank: (function(v){ var n = parseInt(v, 10); return isFinite(n) && n > 0 ? n : 0; })(o.rank),
        rankDate: o.rankDate || "",
        project: o.project || "",
        size: SIZE_NAMES.indexOf(o.size) >= 0 ? o.size : "متوسط",
        pct: (function(v){ var n=Number(v); return isFinite(n) && n>0 ? Math.min(100, Math.round(n/5)*5) : 0; })(o.pct),
        remindLead:(o.remindLead===undefined||o.remindLead===null)?"":String(o.remindLead),
        remindAt:o.remindAt||"",
        reminders: Array.isArray(o.reminders) ? o.reminders : null,
        repeat:o.repeat||"",
        repeatEvery: (function(v){ var n=parseInt(v,10); return isFinite(n)&&n>=1?n:1; })(o.repeatEvery),
        repeatUnit: o.repeatUnit || "week",
        repeatDays: Array.isArray(o.repeatDays) ? o.repeatDays : [],
        repeatEnd: (o.repeatEnd === "count" || o.repeatEnd === "until") ? o.repeatEnd : "never",
        repeatCount: (function(v){ var n=parseInt(v,10); return isFinite(n)&&n>=1?n:0; })(o.repeatCount),
        repeatLeft: (function(v){ var n=parseInt(v,10); return isFinite(n)?n:null; })(o.repeatLeft),
        repeatUntil: o.repeatUntil || "",
        status: stageStatus(stg),
        doneAt:o.doneAt||"", note:o.note||"", createdAt:o.createdAt||""
      };
    });
    var sig = JSON.stringify(next);
    tasksLoaded = true;
    clearLoading();
    if(sig === lastSig) return;
    lastSig = sig;
    tasks = next;
    renderAll();
    backfillNums();
  });

  db.start().then(function(){}, function(){
    clearLoading(); writable = false;
    note("به سرور وصل نشد. صفحه را دوباره باز کنید.", true);
  });

})();
