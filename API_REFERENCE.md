# 📄 مستندات فنی و راهنمای کامل API های پروژه (مخصوص فرانت‌اند)

این سند شامل اطلاعات دقیق و بدون نقص تمام مسیرها (Endpoints)، هدرها، بدنه درخواست‌ها (Request Body)، متغیرهای آدرس (Url Params) و پاسخ‌های واقعی سرور است.

---

## 🛠️ مشخصات کلی سیستم و نحوه اتصال
- **آدرس اصلی سرور (Base URL):** `http://localhost:5000/api`
- **آدرس اتصال به دیتابیس لوکال:** `mongodb://localhost:27017/rice_store`
- **فرمت ارسال داده‌ها:** `application/json` (به استثنای مسیرهای آپلود فایل که از فرمت `multipart/form-data` استفاده می‌کنند).
- **هدر احراز هویت (JWT Authentication):** برای تمامی مسیرهایی که نیاز به لاگین دارند، توکن دریافتی در هدر به صورت زیر ارسال شود:
  ```http
  Authorization: Bearer <TOKEN_VALUE>
  ```

---

## 📋 فهرست دسته‌بندی روت‌ها (API Groups)
1. [کاربران و احراز هویت (Auth)](#1-کاربران-و-احراز-هویت-auth)
2. [محصولات (Products)](#2-محصولات-products)
3. [محصولات شگفت‌انگیز (Amazing Products)](#3-محصولات-شگفت‌انگیز-amazing-products)
4. [سبد خرید (Cart)](#4-سبد-خرید-cart)
5. [سفارشات و پیگیری (Orders)](#5-سفارشات-و-پیگیری-orders)
6. [نظرات (Reviews)](#6-نظرات-reviews)
7. [اسلایدر صفحه اصلی (Slides)](#7-اسلایدر-صفحه-اصلی-slides)
8. [پنل مدیریت عمومی (Admin Dashboard)](#8-پنل-مدیریت-عمومی-admin-dashboard)

---

## 1. کاربران و احراز هویت (Auth)
مسیر پایه: `/api/auth`

### الف) ثبت‌نام کاربر جدید
* **مسیر:** `POST /api/auth/register`
* **ورودی (Body):**
  ```json
  {
    "phone": "09123456789",
    "password": "mySecurePassword123",
    "name": "محمدرضا اسدی"
  }
  ```
* **پاسخ موفق (Status 201):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "60c72b2f9b1d8a1...",
      "phone": "09123456789",
      "name": "محمدرضا اسدی",
      "role": "user"
    }
  }
  ```

### ب) ورود به حساب کاربری
* **مسیر:** `POST /api/auth/login`
* **ورودی (Body):**
  ```json
  {
    "phone": "09123456789",
    "password": "mySecurePassword123"
  }
  ```
* **پاسخ موفق (Status 200):** مشابه خروجی ثبت‌نام بالا به همراه فیلد `token`.

### ج) دریافت اطلاعات کاربر جاری (کیستم من؟)
* **مسیر:** `GET /api/auth/me`
* **هدر الزامی:** `Authorization: Bearer <TOKEN>`
* **پاسخ موفق (Status 200):**
  ```json
  {
    "success": true,
    "user": {
      "id": "60c72b2f...",
      "phone": "09123456789",
      "name": "محمدرضا اسدی",
      "role": "user"
    }
  }
  ```

### د) ویرایش پروفایل کاربری
* **مسیر:** `PUT /api/auth/profile`
* **هدر الزامی:** `Authorization: Bearer <TOKEN>`
* **ورودی (Body - تمام فیلدها اختیاری):**
  ```json
  {
    "name": "نام جدید",
    "phone": "09301234567"
  }
  ```

### هـ) تغییر رمز عبور
* **مسیر:** `PUT /api/auth/change-password`
* **هدر الزامی:** `Authorization: Bearer <TOKEN>`
* **ورودی (Body):**
  ```json
  {
    "oldPassword": "password123",
    "newPassword": "newPassword456"
  }
  ```

---

## 2. محصولات (Products)
مسیر پایه: `/api/products`

### الف) دریافت لیست محصولات (بخش عمومی)
* **مسیر:** `GET /api/products`
* **پارامترهای آدرس (Query Params - اختیاری):**
  * `search`: جستجو در نام یا توضیحات (رشته)
  * `minPrice` و `maxPrice`: بازه قیمت (عدد)
  * `category`: دسته‌بندی (رشته)
  * `isAvailable`: وضعیت موجودی (`true` یا `false`)
* **پاسخ موفق (Status 200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "60c72b2f...",
        "name": "برنج طارم درجه ۱",
        "description": "برنج معطر ایرانی شمال کشور",
        "price": 140000,
        "stock": 100,
        "category": "ایرانی",
        "image": "/uploads/products/image-1623769135.jpg",
        "isAvailable": true,
        "isAmazing": false
      }
    ]
  }
  ```

### ب) دریافت جزئیات یک محصول با شناسه
* **مسیر:** `GET /api/products/:id`

### ج) ایجاد محصول جدید (مخصوص ادمین)
* **مسیر:** `POST /api/products`
* **هدر الزامی:** `Authorization: Bearer <ADMIN_TOKEN>`
* **نوع داده ورودی (Multipart Form-Data):**
  * فیلدهای متنی: `name`, `description`, `price` (عدد), `stock` (عدد), `category` (رشته), `isAvailable` (بولین)
  * فایل تصویر با کلید: `image` (یک فایل عکسی)

### د) ویرایش محصول (مخصوص ادمین)
* **مسیر:** `PUT /api/products/:id`
* **هدر الزامی:** `Authorization: Bearer <ADMIN_TOKEN>`
* **نوع داده ورودی (Multipart Form-Data):** فیلدهای دلخواه برای ویرایش همراه فایل عکس آپشنال با کلید `image`.

### هـ) حذف محصول (مخصوص ادمین)
* **مسیر:** `DELETE /api/products/:id`
* **هدر الزامی:** `Authorization: Bearer <ADMIN_TOKEN>`

---

## 3. محصولات شگفت‌انگیز (Amazing Products)
مسیر پایه: `/api/amazing-products`

### الف) دریافت لیست شگفت‌انگیزها (عمومی)
* **مسیر:** `GET /api/amazing-products`

### ب) ایجاد، ویرایش و حذف محصولات شگفت‌انگیز (مخصوص ادمین)
* **مسیرها:**
  * ثبت شگفت‌انگیز جدید: `POST /api/amazing-products` (ورودی Form-Data شامل عکس با کلید `image`)
  * ویرایش: `PUT /api/amazing-products/:id` (ورودی Form-Data شامل عکس با کلید `image`)
  * حذف: `DELETE /api/amazing-products/:id`

### ج) فعال/غیرفعال کردن وضعیت شگفت‌انگیز یک محصول موجود (مخصوص ادمین)
* **مسیر:** `PUT /api/amazing-products/toggle/:id`
* **هدر الزامی:** `Authorization: Bearer <ADMIN_TOKEN>`
* **پاسخ موفق (Status 200):**
  ```json
  {
    "success": true,
    "message": "محصول به شگفت‌انگیزها اضافه شد",
    "data": {
      "_id": "60c72b2f...",
      "name": "برنج هاشمی",
      "isAmazing": true
    }
  }
  ```

---

## 4. سبد خرید (Cart)
مسیر پایه: `/api/cart`
*(مهم: نیاز به احراز هویت ندارد و اگر توکن ارسال نشود با شناسه موقت `guest` کار می‌کند، اما بهتر است هدر توکن کاربر ارسال شود).*

### الف) مشاهده سبد خرید
* **مسیر:** `GET /api/cart`
* **پاسخ موفق (Status 200):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "60c72...",
      "products": [
        {
          "productId": "60c72b2f...",
          "name": "برنج طارم",
          "price": 140000,
          "quantity": 2,
          "image": "/uploads/..."
        }
      ],
      "totalPrice": 280000
    }
  }
  ```

### ب) افزودن محصول جدید به سبد خرید
* **مسیر:** `POST /api/cart/items`
* **ورودی (Body):**
  ```json
  {
    "productId": "شناسه محصول",
    "quantity": 1
  }
  ```

### ج) ویرایش تعداد کالا در سبد خرید
* **مسیر:** `PUT /api/cart/items/:productId`
* **ورودی (Body):**
  ```json
  {
    "quantity": 3
  }
  ```
  *(اگر تعداد را `0` بفرستید، محصول به طور خودکار از سبد خرید حذف خواهد شد).*

### د) حذف محصول از سبد خرید
* **مسیر:** `DELETE /api/cart/items/:productId`

### هـ) خالی کردن کامل سبد خرید
* **مسیر:** `DELETE /api/cart`

---

## 5. سفارشات و پیگیری (Orders)
مسیر پایه: `/api/orders`

### الف) ثبت سفارش جدید (بهمراه امکان آپلود رسید پرداخت فیش کارت به کارت)
* **مسیر:** `POST /api/orders`
* **هدر الزامی:** `Authorization: Bearer <TOKEN>`
* **نوع داده ورودی (Multipart Form-Data):**
  * فیلدهای متنی:
    * `shippingAddress`: رشته - آدرس پستی دقیق گیرنده
    * `postalCode`: رشته - کد پستی ۱۰ رقمی
    * `receiverName`: رشته - نام دریافت‌کننده
    * `receiverPhone`: رشته - شماره تلفن گیرنده
  * فایل فیش واریزی با کلید: `receipt` (یک فایل عکسی آپشنال)

### ب) دریافت سفارشات من (کاربر لاگین شده)
* **مسیر:** `GET /api/orders`
* **هدر الزامی:** `Authorization: Bearer <TOKEN>`

### ج) دریافت جزئیات یک سفارش خاص
* **مسیر:** `GET /api/orders/:id`
* **هدر الزامی:** `Authorization: Bearer <TOKEN>`

### د) آپلود فیش پرداخت برای سفارش ثبت‌شده قبلی
* **مسیر:** `POST /api/orders/:id/receipt` یا `PUT /api/orders/:id/receipt`
* **نوع داده ورودی (Multipart Form-Data):** فایل فیش واریزی با کلید `receipt`.

### هـ) پیگیری پستی سفارش با کد رهگیری (بدون نیاز به لاگین - عمومی)
* **مسیر:** `GET /api/orders/track/:postTrackingCode` یا `GET /api/orders/track/:code`

### و) تایید پرداخت سفارش و تغییر وضعیت توسط ادمین
* **مسیرها (مخصوص ادمین با هدر توکن ادمین):**
  * تایید/رد رسید پرداخت: `PUT /api/orders/:id/verify-payment` با بادی `{ "isVerified": true }`
  * تغییر وضعیت کلی ارسال سفارش: `PUT /api/orders/:id/status` با بادی `{ "status": "shipped", "postTrackingCode": "12345..." }`
    *(وضعیت‌های مجاز: `pending`, `shipped`, `delivered`, `cancelled`)*

---

## 6. نظرات (Reviews)
مسیر پایه: `/api/reviews`

* **دریافت لیست نظرات یک محصول (عمومی):** `GET /api/reviews` (با Query parameter مثلاً `?productId=60c72b2f...`)
* **ثبت نظر جدید (کاربر لاگین شده):**
  * **مسیر:** `POST /api/reviews`
  * **ورودی (Body):** `{ "productId": "...", "rating": 5, "comment": "کیفیت بسیار عالی داشت" }`
* **پاسخ دادن به نظر یا حذف نظر (مخصوص ادمین):**
  * پاسخ به نظر: `POST /api/reviews/:id/reply` با بادی `{ "replyText": "..." }`
  * حذف نظر: `DELETE /api/reviews/:id`

---

## 7. اسلایدر صفحه اصلی (Slides)
مسیر پایه: `/api/slides`

* **دریافت لیست بنرهای اسلایدر صفحه اول (عمومی):** `GET /api/slides`
* **ایجاد اسلاید جدید (مخصوص ادمین):**
  * **مسیر:** `POST /api/slides`
  * **ورودی (Form-Data):** کلید `title` (رشته)، کلید `link` (رشته آدرس لینک بنر) و فایل عکس با کلید `image`.
* **ویرایش بنر اسلاید (مخصوص ادمین):** `PUT /api/slides/:id` (با فرمت Form-Data و کلید تصویر `image`).
* **حذف اسلاید (مخصوص ادمین):** `DELETE /api/slides/:id`

---

## 8. پنل مدیریت عمومی (Admin Dashboard)
مسیر پایه: `/api/admin`
*(تمام این مسیرها بدون استثنا نیاز به هدر توکن با نقش `admin` دارند).*

* **آمار کلی داشبورد ادمین:** `GET /api/admin/dashboard`
  * آمارهای کلی درآمد، تعداد محصولات، تعداد کاربران، نظرات و آخرین سفارشات ثبت‌شده را برمی‌گرداند.
* **دریافت لیست کل کاربران:** `GET /api/admin/users`
* **تغییر نقش یک کاربر (مثلاً ارتقا به ادمین یا بالعکس):**
  * **مسیر:** `PUT /api/admin/users/:id/role`
  * **ورودی (Body):** `{ "role": "admin" }` (یا `user`)
* **فعال یا غیرفعال‌سازی وضعیت حساب کاربر (بلاک/آنبلاک):**
  * **مسیر:** `PUT /api/admin/users/:id/toggle-status`
* **مشاهده تمامی سفارشات موجود در سیستم:** `GET /api/admin/orders`
