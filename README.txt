دفتر کارها — نصب روی سرور
==========================

۱) فایل‌ها را روی سرور بگذارید، مثلاً در /opt/daftar
   server.py و app.html باید کنار هم باشند.

۲) اجرا:
      cd /opt/daftar
      python3 server.py 8700

   بار اول فایل users.json خودش ساخته می‌شود و لینک مالک در ترمینال چاپ می‌شود.

۳) پورت را باز کنید:
      sudo ufw allow 8700/tcp

   حالا از بیرون:  http://<آی‌پی ثابت شما>:8700/?k=<توکن>

۴) اشخاص را اضافه کنید — فایل users.json:

   {"users":[
     {"name":"احسان","role":"owner","token":"..."},
     {"name":"احد صابر","role":"member","token":"یک-رشتهٔ-تصادفی-بلند"},
     {"name":"محمد خان‌جانی","role":"member","token":"یک-رشتهٔ-تصادفی-دیگر"}
   ]}

   name باید دقیقاً همان نامی باشد که در «شخص مربوط» کارها می‌نویسید.
   role یکی از owner یا member است؛ بقیهٔ سطوح دسترسی در خود برنامه تنظیم می‌شود.
   برای ساختن توکن:  python3 -c "import secrets;print(secrets.token_urlsafe(18))"
   بعد از تغییر users.json، سرویس را یک بار restart کنید.

   لینک هر نفر:  http://<آی‌پی>:8700/?k=<توکن خودش>
   یک بار که بازش کند در مرورگرش می‌ماند و دفعهٔ بعد فقط آدرس ساده کافی است.

۵) اجرای دائمی با systemd — فایل /etc/systemd/system/daftar.service :

   [Unit]
   Description=Daftar Karha
   After=network.target

   [Service]
   WorkingDirectory=/opt/daftar
   ExecStart=/usr/bin/python3 /opt/daftar/server.py 8700
   Restart=always
   User=root

   [Install]
   WantedBy=multi-user.target

   سپس:
      sudo systemctl daemon-reload
      sudo systemctl enable --now daftar

۶) پشتیبان: کل داده در data.json است. همین یک فایل را کپی بگیرید.

نکتهٔ امنیتی: روی http ساده، توکن‌ها و داده‌ها رمزنگاری‌نشده رد و بدل می‌شوند.
با گرفتن یک زیردامنهٔ رایگان (DuckDNS) و گذاشتن Caddy جلوی این سرویس،
HTTPS خودکار می‌شود و این ریسک برطرف می‌شود.
