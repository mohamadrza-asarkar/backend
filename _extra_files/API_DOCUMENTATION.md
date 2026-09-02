# 📘 مستندات جامع فنی و راهنمای کامل اتصال API فروشگاه برنج

این مستند شامل مشخصات فنی، هدرها، پارامترهای ورودی، ساختار بدنه (Request Body) و پاسخ (Response) تمامی نقاط اتصال (Endpoints) موجود در وب‌سرویس فروشگاه برنج است. این فایل به عنوان یک مرجع کامل طراحی شده تا هر هوش مصنوعی یا توسعه‌دهنده‌ای بتواند به راحتی فرانت‌اند پروژه را با آن همگام کند.

---

## 📌 تنظیمات و پیکربندی‌های کلی

* **آدرس پایه (Base URL):** `https://ais-dev-rpvkewlvjilhjnoamjgjvq-240344892228.europe-west1.run.app/api`
* **هدرهای عمومی (Common Headers):**
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>` (برای تمامی نقاط اتصال محافظت شده)

### 🖼️ سیستم هوشمند مدیریت تصاویر و سئو:
1. **آپلود تصاویر:** بک‌اند از دو روش پشتیبانی می‌کند:
   - ارسال تصاویر به صورت رشته متنی **Base64** درون آبجکت JSON تحت فیلد `imageBase64`.
   - ارسال باینری فایل از طریق فرم‌دیتا (`multipart/form-data`) تحت کلید `image`.
2. **عدم ذخیره تصاویر سنگین در دیتابیس:** بک‌اند رشته‌های Base64 را دیکد کرده و به صورت فایل فیزیکی با فرمت‌های بهینه `.png` یا `.jpg` روی هارددیسک سرور ذخیره می‌کند و تنها آدرس نسبی کوتاه آن را در دیتابیس ذخیره می‌نماید.
3. **لینک‌های سئو شده (SEO-Friendly Slugs):** نام محصول به صورت خودکار به اسلاگ فارسی/انگلیسی تبدیل شده و با هش فشرده در قالب یک لینک سئو شده روی سرور ذخیره می‌شود (مثال: `/uploads/products/برنج-طارم-هاشمی-61b47c0d.jpg`).
4. **جلوگیری از تکرار تصاویر (Deduplication):** بر اساس الگوریتم هش MD5، اگر تصویری تکراری آپلود شود، فایل جدید ایجاد نشده و لینک فایل ذخیره‌شده قبلی برمی‌گردد.

---

## 🔑 ۱. بخش احراز هویت و کاربران (Authentication & Profile)

مسیر اصلی: `/api/auth`

### 1.1 ثبت‌نام کاربر جدید (Register)
* **آدرس:** `POST /api/auth/register`
* **دسترسی:** عمومی
* **بدنه درخواست (Request Body):**
```json
{
  "name": "محمدرضا",
  "email": "user@example.com",
  "password": "password123",
  "phone": "09123456789"
}
```
* **پاسخ موفق (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "ثبت‌نام با موفقیت انجام شد",
  "data": {
    "user": {
      "_id": "64ebd3a51f2a4c11b0e98c11",
      "name": "محمدرضا",
      "email": "user@example.com",
      "phone": "09123456789",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 ورود به حساب کاربری (Login)
* **آدرس:** `POST /api/auth/login`
* **دسترسی:** عمومی
* **بدنه درخواست:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "ورود با موفقیت انجام شد",
  "data": {
    "user": {
      "_id": "64ebd3a51f2a4c11b0e98c11",
      "name": "محمدرضا",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 دریافت اطلاعات کاربری جاری (Get Profile)
* **آدرس:** `GET /api/auth/me`
* **دسترسی:** کاربر لاگین شده (`Authorization: Bearer <TOKEN>`)
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات کاربری با موفقیت دریافت شد",
  "data": {
    "_id": "64ebd3a51f2a4c11b0e98c11",
    "name": "محمدرضا",
    "email": "user@example.com",
    "phone": "09123456789",
    "role": "user",
    "isActive": true
  }
}
```

### 1.4 به‌روزرسانی پروفایل (Update Profile)
* **آدرس:** `PUT /api/auth/profile`
* **دسترسی:** کاربر لاگین شده
* **بدنه درخواست:**
```json
{
  "name": "محمدرضا عسکرکار",
  "phone": "09121112222"
}
```
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "پروفایل با موفقیت به‌روزرسانی شد",
  "data": {
    "_id": "64ebd3a51f2a4c11b0e98c11",
    "name": "محمدرضا عسکرکار",
    "email": "user@example.com",
    "phone": "09121112222",
    "role": "user"
  }
}
```

### 1.5 تغییر رمز عبور (Change Password)
* **آدرس:** `PUT /api/auth/change-password`
* **دسترسی:** کاربر لاگین شده
* **بدنه درخواست:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newSecurePassword123"
}
```
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "رمز عبور با موفقیت تغییر یافت"
}
```

---

## 🌾 ۲. بخش مدیریت محصولات برنج (Products)

مسیر اصلی: `/api/products`

### 2.1 دریافت لیست محصولات با جستجو، فیلتر و صفحه‌بندی (Get Products)
* **آدرس:** `GET /api/products`
* **دسترسی:** عمومی
* **پارامترهای کوئری (Query Params - اختیاری):**
  * `page`: شماره صفحه (مثال: `1`)
  * `limit`: تعداد محصول در هر صفحه (مثال: `10`)
  * `search` یا `q`: جستجو در نام و توضیحات (مثال: `طارم`)
  * `isAvailable`: وضعیت موجودی (`true` / `false`)
  * `isAmazing`: شگفت‌انگیز بودن (`true` / `false`)
  * `minPrice` / `maxPrice`: بازه قیمتی به تومان (مثال: `100000`)
  * `sortBy`: مرتب‌سازی بر اساس:
    * `newest` (جدیدترین)
    * `cheapest` (ارزان‌ترین)
    * `expensive` (گران‌ترین)
    * `most-discount` (بیشترین تخفیف)
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "لیست محصولات برنج با موفقیت دریافت شد",
  "data": [
    {
      "_id": "64ebd3a51f2a4c11b0e98c12",
      "name": "برنج طارم هاشمی گیلان",
      "description": "کشت اول معطر خوشپخت ممتاز ری‌کده",
      "price": 120000,
      "originalPrice": 120000,
      "discountPercent": 0,
      "isAmazing": false,
      "amazingExpiresAt": null,
      "isAvailable": true,
      "countInStock": 500,
      "image": "https://yourdomain.com/uploads/products/برنج-طارم-هاشمی-گیلان-f3b1a20c.jpg",
      "imageUrl": "https://yourdomain.com/uploads/products/برنج-طارم-هاشمی-گیلان-f3b1a20c.jpg",
      "fullImageUrl": "https://yourdomain.com/uploads/products/برنج-طارم-هاشمی-گیلان-f3b1a20c.jpg",
      "reviews": [],
      "createdAt": "2026-08-28T04:20:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalItems": 15,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2.2 دریافت اطلاعات یک محصول با شناسه (Get Product By ID)
* **آدرس:** `GET /api/products/:id`
* **دسترسی:** عمومی
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات محصول با موفقیت دریافت شد",
  "data": {
    "_id": "64ebd3a51f2a4c11b0e98c12",
    "name": "برنج طارم هاشمی گیلان",
    "description": "کشت اول معطر خوشپخت ممتاز ری‌کده",
    "price": 120000,
    "isAvailable": true,
    "image": "https://yourdomain.com/uploads/products/برنج-طارم-هاشمی-گیلان-f3b1a20c.jpg"
  }
}
```

### 2.3 ایجاد محصول جدید (Create Product)
* **آدرس:** `POST /api/products`
* **دسترسی:** مدیر سیستم (`Admin Only`)
* **بدنه درخواست (ارسال تصویر به صورت Base64):**
```json
{
  "name": "برنج نیم دانه معطر طارم",
  "description": "نیم دانه خالص بسیار معطر مناسب شله زرد و پخت خانگی",
  "originalPrice": 85000,
  "discountPercent": 10,
  "countInStock": 150,
  "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```
* **پاسخ موفق (21):**
```json
{
  "success": true,
  "statusCode": 21,
  "message": "محصول برنج جدید با موفقیت ایجاد و تصویر در سرور ذخیره شد",
  "data": {
    "_id": "64ebd3a51f2a4c11b0e98d89",
    "name": "برنج نیم دانه معطر طارم",
    "originalPrice": 85000,
    "discountPercent": 10,
    "price": 76500,
    "isAmazing": false,
    "image": "https://yourdomain.com/uploads/products/برنج-نیم-دانه-معطر-طارم-cb92a7f8.png"
  }
}
```

### 2.4 ویرایش محصول (Update Product)
* **آدرس:** `PUT /api/products/:id`
* **دسترسی:** مدیر سیستم
* **بدنه درخواست:**
```json
{
  "name": "برنج نیم دانه معطر طارم هاشمی ممتاز",
  "price": 78000
}
```

### 2.5 حذف محصول (Delete Product)
* **آدرس:** `DELETE /api/products/:id`
* **دسترسی:** مدیر سیستم

---

## ⚡ ۳. بخش پیشنهادهای شگفت‌انگیز (Amazing Products)

مسیر اصلی: `/api/amazing-products` یا `/api/products/amazing`

### 3.1 دریافت لیست محصولات شگفت‌انگیز (Get Amazing Products)
* **آدرس:** `GET /api/amazing-products`
* **دسترسی:** عمومی
* **پارامترهای کوئری:** `page`, `limit`, `sortBy`
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "لیست محصولات شگفت‌انگیز با موفقیت دریافت شد",
  "data": [
    {
      "_id": "64ebd3a51f2a4c11b0e98c56",
      "name": "برنج صدری دم سیاه اعلا",
      "originalPrice": 160000,
      "discountPercent": 25,
      "price": 120000,
      "isAmazing": true,
      "amazingExpiresAt": "2026-08-30T23:59:59.000Z",
      "image": "https://yourdomain.com/uploads/products/برنج-صدری-دم-سیاه-اعلا-7a8e9f5d.jpg"
    }
  ]
}
```

### 3.2 ایجاد محصول شگفت‌انگیز جدید (Create Amazing Product)
* **آدرس:** `POST /api/amazing-products`
* **دسترسی:** مدیر سیستم
* **بدنه درخواست:**
```json
{
  "name": "سر لاشه دودی هاشمی",
  "originalPrice": 110000,
  "discountPercent": 15,
  "amazingExpiresAt": "2026-08-31T20:00:00.000Z",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

### 3.3 ویرایش محصول شگفت‌انگیز (Update Amazing Product)
* **آدرس:** `PUT /api/amazing-products/:id`
* **دسترسی:** مدیر سیستم

### 3.4 حذف محصول شگفت‌انگیز (Delete Amazing Product)
* **آدرس:** `DELETE /api/amazing-products/:id`
* **دسترسی:** مدیر سیستم

---

## 🛒 ۴. سبد خرید (Shopping Cart)

مسیر اصلی: `/api/cart`
*سیستم سبد خرید هوشمند است؛ برای کاربران مهمان در `session`/حافظه موقت و برای کاربران لاگین شده مستقیماً در اکانت کاربری آن‌ها ذخیره و همگام می‌شود.*

### 4.1 دریافت کل سبد خرید (Get Cart)
* **آدرس:** `GET /api/cart`
* **دسترسی:** عمومی (اختیاری با توکن)
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "سبد خرید با موفقیت دریافت شد",
  "data": {
    "items": [
      {
        "productId": "64ebd3a51f2a4c11b0e98c12",
        "name": "برنج طارم هاشمی گیلان",
        "price": 120000,
        "quantity": 10,
        "image": "https://yourdomain.com/uploads/products/برنج-طارم-هاشمی-گیلان-f3b1a20c.jpg",
        "totalItemPrice": 1200000
      }
    ],
    "totalPrice": 1200000,
    "totalItems": 10
  }
}
```

### 4.2 افزودن آیتم به سبد خرید (Add Item)
* **آدرس:** `POST /api/cart/items`
* **دسترسی:** عمومی / کاربر لاگین شده
* **بدنه درخواست:**
```json
{
  "productId": "64ebd3a51f2a4c11b0e98c12",
  "quantity": 5
}
```

### 4.3 به‌روزرسانی تعداد آیتم در سبد خرید (Update Item Quantity)
* **آدرس:** `PUT /api/cart/items/:productId`
* **دسترسی:** عمومی / کاربر لاگین شده
* **بدنه درخواست:**
```json
{
  "quantity": 8
}
```

### 4.4 حذف یک محصول از سبد خرید (Remove Item)
* **آدرس:** `DELETE /api/cart/items/:productId`

### 4.5 خالی کردن کامل سبد خرید (Clear Cart)
* **آدرس:** `DELETE /api/cart`

---

## 📦 ۵. ثبت، مدیریت و رهگیری سفارشات با کد رهگیری پستی (Orders & Postal Tracking)

مسیر اصلی: `/api/orders`

### 5.1 ثبت سفارش جدید (Create Order)
* **آدرس:** `POST /api/orders`
* **دسترسی:** کاربر لاگین شده (`Authorization: Bearer <TOKEN>`)
* **توضیحات:** سفارش با اطلاعات مشتری و محصولات ثبت شده و در انتظار پرداخت یا بررسی قرار می‌گیرد. کاربر می‌تواند فیش واریزی را مستقیماً با فایل (`receipt`) یا فیلد Base64 (`paymentReceipt`) ارسال کند.
* **بدنه درخواست (JSON یا فرم‌دیتا):**
```json
{
  "name": "محمدرضا اسدی",
  "phone": "09121112233",
  "address": "تهران، میدان ونک، خیابان ملاصدرا",
  "postalCode": "1991812345",
  "products": [
    {
      "name": "برنج طارم هاشمی درجه یک مازندران",
      "price": 210000,
      "quantity": 2
    }
  ],
  "paymentReceipt": "/uploads/receipts/sample_receipt.jpg"
}
```
* **پاسخ موفق (201):**
```json
{
  "success": true,
  "message": "سفارش با موفقیت ثبت شد",
  "data": {
    "_id": "6a95d484a5d7fc5f52b44914",
    "name": "محمدرضا اسدی",
    "phone": "09121112233",
    "address": "تهران، میدان ونک، خیابان ملاصدرا",
    "postalCode": "1991812345",
    "postTrackingCode": "",
    "state": "pending",
    "paymentStatus": "pending",
    "paymentReceipt": "",
    "paymentReceiptDate": null,
    "products": [...],
    "totalPrice": 420000,
    "createdAt": "2026-09-01T15:48:03.338Z"
  }
}
```

### 5.2 استعلام و رهگیری سفارش با کد رهگیری پستی (Track Order by Postal Code)
* **آدرس:** `GET /api/orders/track/:postTrackingCode`
* **دسترسی:** عمومی (بدون نیاز به لاگین)
* **توضیحات:** استعلام سفارش با استفاده از کد رهگیری پستی وارد شده توسط ادمین (یا شناسه سفارش).
* **پاسخ موفق (200):** اطلاعات کامل سفارش به همراه وضعیت، فیش پرداخت و کد مرسوله پستی.

### 5.3 ارسال یا آپلود رسید پرداخت بانکی (Upload Payment Receipt)
* **آدرس:** `PUT /api/orders/:id/receipt` یا `POST /api/orders/:id/receipt`
* **دسترسی:** کاربر صاحب سفارش / ادمین
* **بدنه درخواست (فایل با کلید `receipt` یا JSON با فیلد `receiptImage` / `paymentReceipt`):**
```json
{
  "receiptImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### 5.4 بررسی، تایید یا رد رسید پرداخت توسط ادمین (Verify Payment)
* **آدرس:** `PUT /api/orders/:id/verify-payment`
* **دسترسی:** مدیر سیستم (`Admin Only`)
* **بدنه درخواست:**
```json
{
  "status": "approved",
  "state": "processing",
  "adminNote": "فیش بانکی تایید شد و سفارش در حال بسته‌بندی است"
}
```

### 5.5 تغییر وضعیت سفارش و ثبت دستی کد رهگیری مرسوله پستی (Update Status & Postal Tracking Code)
* **آدرس:** `PUT /api/orders/:id/status`
* **دسترسی:** مدیر سیستم (`Admin Only`)
* **بدنه درخواست:**
```json
{
  "state": "shipped",
  "postTrackingCode": "241098234509123891238912",
  "adminNote": "بسته تحویل اداره پست شد و کد رهگیری پستی ثبت گردید"
}
```

### 5.6 دریافت لیست سفارشات من (My Orders)
* **آدرس:** `GET /api/orders`
* **دسترسی:** کاربر لاگین شده

### 5.7 دریافت جزئیات یک سفارش با شناسه (Get Order By ID)
* **آدرس:** `GET /api/orders/:id`
* **دسترسی:** کاربر صاحب سفارش / مدیر سیستم

---

## 💬 ۶. بخش نظرات و امتیازدهی (Reviews)

مسیر اصلی: `/api/reviews`

### 6.1 دریافت لیست نظرات یک محصول (Get Product Reviews)
* **آدرس:** `GET /api/reviews?productId=64ebd3a51f2a4c11b0e98c12`
* **دسترسی:** عمومی

### 6.2 ثبت نظر جدید روی محصول (Create Review)
* **آدرس:** `POST /api/reviews`
* **دسترسی:** کاربر لاگین شده
* **بدنه درخواست:**
```json
{
  "productId": "64ebd3a51f2a4c11b0e98c12",
  "comment": "عالی و معطر بود، ری بسیار خوبی داشت.",
  "rating": 5
}
```

### 6.3 پاسخ به نظر کاربران (مخصوص مدیر)
* **آدرس:** `POST /api/reviews/:id/reply`
* **دسترسی:** مدیر سیستم
* **بدنه درخواست:**
```json
{
  "comment": "با سلام، خوشحالیم که رضایت داشتید. خدمت به شما افتخار ماست."
}
```

### 6.4 حذف نظر (مخصوص مدیر)
* **آدرس:** `DELETE /api/reviews/:id`
* **دسترسی:** مدیر سیستم

---

## 🎨 ۷. بخش اسلایدرها و بنرهای داینامیک (Slides)

مسیر اصلی: `/api/slides`

### 7.1 دریافت اسلایدها (Get Slides)
* **آدرس:** `GET /api/slides`
* **دسترسی:** عمومی
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "اسلایدرها با موفقیت دریافت شدند",
  "data": [
    {
      "_id": "64ebd3a51f2a4c11b0e98ca9",
      "image": "https://yourdomain.com/uploads/slides/slides-17878934.jpg",
      "createdAt": "2026-08-28T04:00:00.000Z"
    }
  ]
}
```

### 7.2 ایجاد اسلاید جدید (Create Slide)
* **آدرس:** `POST /api/slides`
* **دسترسی:** مدیر سیستم
* **بدنه درخواست:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

### 7.3 حذف اسلاید (Delete Slide)
* **آدرس:** `DELETE /api/slides/:id`
* **دسترسی:** مدیر سیستم

---

## 📊 ۸. پنل مدیریتی ادمین (Admin Services)

مسیر اصلی: `/api/admin`
*تمامی نقاط اتصال به هدر توکن ادمین نیاز دارند.*

### 8.1 دریافت آمارهای پیشرفته داشبورد مدیریتی (Dashboard Stats)
* **آدرس:** `GET /api/admin/dashboard`
* **دسترسی:** مدیر سیستم
* **پاسخ موفق (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "آمار داشبورد با موفقیت دریافت شد",
  "data": {
    "totalRevenue": 24500000,
    "totalOrders": 124,
    "pendingOrders": 12,
    "processingOrders": 18,
    "shippedOrders": 14,
    "completedOrders": 75,
    "cancelledOrders": 5,
    "totalUsers": 82,
    "totalProducts": 18,
    "outOfStockCount": 3,
    "salesHistory": [
      { "date": "1405-06-01", "sales": 1200000 },
      { "date": "1405-06-02", "sales": 1850000 }
    ]
  }
}
```

### 8.2 دریافت لیست تمامی کاربران فروشگاه
* **آدرس:** `GET /api/admin/users`

### 8.3 ارتقا یا تغییر سطح کاربری کاربر (Update User Role)
* **آدرس:** `PUT /api/admin/users/:id/role`
* **بدنه درخواست:**
```json
{
  "role": "admin" // مقادیر مجاز: 'user', 'admin'
}
```

### 8.4 فعال/غیرفعال کردن وضعیت کاربر (Ban/Unban User)
* **آدرس:** `PUT /api/admin/users/:id/toggle-status`

### 8.5 دریافت لیست کامل سفارشات همه کاربران جهت پردازش
* **آدرس:** `GET /api/admin/orders`

---

## 🛠️ ۹. بخش تست و مستندات فنی سیستمی (System & Labs)

مسیر اصلی: `/api/docs`

* **مشاهده مستندات تعاملی Swagger (بخش OpenAPI):**
  `GET /api/docs/openapi.json`
* **دریافت کالکشن آماده تست پست‌من:**
  `GET /api/docs/postman.json`
* **بررسی وضعیت کلی سلامتی سرور:**
  `GET /api/docs/health`
* **دریافت معیارهای سیستمی و سرعت لود:**
  `GET /api/docs/metrics`
* **بررسی و ریست موقت دیتابیس (سیستم Fallback):**
  `POST /api/docs/reset-db`
* **آزمایشگاه امنیت رمزنگاری پسورد با Bcrypt:**
  `POST /api/docs/lab/hash-password` (با ارسال `"password"` خروجی هش‌شده تحویل می‌دهد)
