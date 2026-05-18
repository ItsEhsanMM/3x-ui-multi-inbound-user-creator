# 3xui Multi Inbound Dashboard

یک داشبورد ساده برای مدیریت پنل 3x-ui شامل:

- نمایش وضعیت سرور (CPU / RAM)
- نمایش مصرف شبکه (Upload / Download)
- نمایش کاربران آنلاین
- ساخت کاربر جدید
- تولید لینک Subscription
- پشتیبانی از چند Inbound

- تست شده روی نسخه 3.0.1

---

## تکنولوژی‌ها

- HTML / CSS / JavaScript (Vanilla)
- Vite
- Fetch API

---

## نصب

```bash
git clone https://github.com/ItsEhsanMM/3x-ui-multi-inbound-user-creator.git
cd 3x-ui-multi-inbound-user-creator
npm install
```

---

## تنظیم ENV

```env
VITE_PANEL_BASE=https://your-panel.com // آدرس پنل
VITE_SUB_BASE=https://your-sub.com // آدرس لینک ساب
VITE_INBOUND_IDS=1,2,3 // آیدی اینباند هایی که میخواهید ثابت به آن یوزر اضاف شود
```

---

## اجرا

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

---

project/
├── src/ /n
│   ├── main.js
│   └── style.css
├── index.html
└── .env

---

## امنیت

- توکن را پابلیک نکن
- بهتر است backend proxy اضافه شود
- مسیر اجرایی پروژه را مخفی کن

---

## پیشنهاد برای Production

- بهتر است پروژه را پشت Reverse Proxy مثل Nginx اجرا کنید.

نمونه:

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
    }
}
```

