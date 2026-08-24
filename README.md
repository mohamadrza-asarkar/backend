# 🚀 فروشگاه اینترنتی و پنل مدیریت REST API (Node.js & Express)

یک بک‌اند RESTful مدرن، تمیز و ماژولار نوشته شده با **Node.js (ES Modules)** و **Express** با ساختار مدل‌سازی الهام گرفته از Mongoose، احراز هویت امن با **JWT**، هش رمز با **Bcrypt** و آپلود فایل با **Multer**.

---

## 🗂️ اسکیماها و ساختار داده‌ها (Data Schemas)

1. **اسلاید (Slide):**
   - فقط شامل یک تصویر (`image`) است که از طریق **مالتر (Multer)** یا آدرس تصویر ذخیره می‌شود.

2. **محصول (Product):**
   - شامل: اسم (`name`)، توضیحات (`description`)، قیمت (`price`)، وضعیت موجود بودن یا نبودن (`isAvailable`) و نظرات (`reviews`).

3. **کارت / سبد خرید (Cart):**
   - شامل: چند محصول (`products`) با تعداد و قیمت کل.

4. **سفارش (Order):**
   - شامل: محصولات (`products`)، نام و نام خانوادگی خریدار (`buyerName`)، آدرس (`address`) و شماره تلفن (`phone`).

5. **نظر / دیدگاه (Review):**
   - شامل: فرستنده (`sender`)، متن نظر (`comment`) و امتیاز (`rating` بین ۱ تا ۵).

---

## 📁 ساختار پوشه‌بندی پروژه (Project Structure)

```text
├── index.js                     # فایل اجرای اصلی سرور
├── app.js                       # پیکربندی Express، CORS و میدلورها
├── package.json                 # وابستگی‌ها و اسکریپت‌ها
├── public/                      # فایل‌های استاتیک و تصاویر آپلود شده
│   └── uploads/slides/          # محل ذخیره تصاویر مالتر
└── src/
    ├── models/                  # مدل‌های دیتابیس
    │   ├── slide.model.js       # مدل اسلاید (تصویر با مالتر)
    │   ├── product.model.js     # مدل محصول (اسم، توضیحات، قیمت، موجودی، نظرات)
    │   ├── cart.model.js        # مدل کارت خرید (چند محصول)
    │   ├── order.model.js       # مدل سفارش (خریدار، آدرس، تلفن، محصولات)
    │   ├── review.model.js      # مدل نظرات (فرستنده، متن، امتیاز)
    │   └── db.js                # موتور ذخیره‌سازی
    ├── middlewares/             # میدلورهای عمومی
    │   ├── auth.middleware.js   # احراز هویت JWT و بررسی نقش ادمین
    │   ├── upload.middleware.js # میدلور آپلود با Multer
    │   ├── validate.middleware.js # اعتبارسنجی ورودی‌ها
    │   └── error.middleware.js  # مدیریت خطاها
    ├── utils/                   # توابع کمکی
    │   ├── jwt.js               # تولید و تایید JWT
    │   ├── password.js          # توابع هش Bcrypt
    │   └── response.js          # فرمت استاندارد پاسخ‌ها
    └── routes/                  # مسیرها، کنترلرها و اعتبارسنجی‌ها
        ├── slides/              # مسیر اسلایدها و آپلود مالتر
        ├── products/            # مسیر محصولات
        ├── cart/                # مسیر سبد خرید
        ├── orders/              # مسیر سفارشات
        ├── reviews/             # مسیر نظرات
        ├── auth/                # مسیر احراز هویت
        ├── admin/               # مسیر داشبورد مدیریت
        └── docs/                # خروجی OpenAPI و Postman
```

---

## 🚀 راهنمای نصب و راه‌اندازی (Quick Start)

### ۱. کلون کردن ریپازیتوری
```bash
git clone <URL_ریپازیتوری_شما>
cd <نام_پوشه>
```

### ۲. نصب پکیج‌ها
```bash
npm install
```

### ۳. تنظیم متغیرهای محیطی
یک فایل `.env` بر اساس `.env.example` بسازید:
```bash
cp .env.example .env
```

### ۴. اجرای سرور
```bash
npm start
# یا برای حالت توسعه با لود مجدد:
npm run dev
```

سرور روی آدرس `http://localhost:3000` اجرا خواهد شد.

---

## 📦 گیت و انتشار روی گیت‌هاب (Push to GitHub)

برای ارسال پروژه به حساب گیت‌هاب خود، دستورات زیر را در ترمینال اجرا کنید:

```bash
# ۱. ایجاد مخزن محلی گیت
git init

# ۲. افزودن فایل‌ها
git add .

# ۳. ثبت کامیت
git commit -m "feat: complete e-commerce backend with exact schemas & multer"

# ۴. نام‌گذاری برنچ اصلی
git branch -M main

# ۵. اتصال به ریپازیتوری گیت‌هاب (آدرس ریپازیتوری خود را جایگزین کنید)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# ۶. ارسال نهایی به گیت‌هاب
git push -u origin main
```

---

## 🧪 کاربران تستی برای ورود و تست توکن

| نقش | ایمیل | رمز عبور |
|---|---|---|
| مدیر کل (Admin) | `admin@store.ir` | `admin123456` |
| مشتری (User) | `user@store.ir` | `user123456` |
