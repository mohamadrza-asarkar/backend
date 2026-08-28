# 📡 مستندات جامع فنی API (Backend API Technical Documentation)

- **Base URL:** `https://ais-dev-rpvkewlvjilhjnoamjgjvq-240344892228.europe-west1.run.app/api`
- **Default Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (برای مسیرهای نیازمند احراز هویت)

---

## 📋 ساختار استاندارد پاسخ‌های سرور (Standard Response Envelope)

### پاسخ موفق (Success):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "پیام عملیات موفق",
  "data": {}
}
```

### پاسخ خطا (Error):
```json
{
  "success": false,
  "statusCode": 400,
  "message": "توضیح خطا",
  "errors": {
    "field": "پیام خطای فیلد خاص (در صورت خطای ولیدیشن ۴۲۲)"
  }
}
```

---

## 1. احراز هویت و کاربران (Auth & User API) - `/api/auth`

### 1.1 ثبت‌نام کاربر جدید
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Auth:** Public
- **Request Body:**
```json
{
  "name": "نام کاربر",
  "phone": "09121234567",
  "password": "password123",
  "address": "تهران، خیابان آزادی (اختیاری)"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "ثبت‌نام با موفقیت انجام شد",
  "data": {
    "user": {
      "_id": "64ebd3a51f2a4c11b0e98ca9",
      "name": "نام کاربر",
      "phone": "09121234567",
      "role": "user",
      "address": "تهران، خیابان آزادی",
      "avatar": "https://ui-avatars.com/api/?name=نام+کاربر&background=random",
      "createdAt": "2026-08-28T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.2 ورود به حساب کاربری
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Auth:** Public
- **Request Body:**
```json
{
  "phone": "09121234567",
  "password": "password123"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "ورود با موفقیت انجام شد",
  "data": {
    "user": {
      "_id": "64ebd3a51f2a4c11b0e98ca9",
      "name": "نام کاربر",
      "phone": "09121234567",
      "role": "user",
      "avatar": "https://...",
      "address": "تهران",
      "createdAt": "2026-08-28T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 1.3 دریافت اطلاعات کاربر لاگین‌شده
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Auth:** Bearer Token
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات پروفایل کاربر دریافت شد",
  "data": {
    "user": {
      "_id": "64ebd3a51f2a4c11b0e98ca9",
      "name": "نام کاربر",
      "phone": "09121234567",
      "role": "user",
      "avatar": "https://...",
      "address": "تهران",
      "isActive": true,
      "createdAt": "2026-08-28T12:00:00.000Z"
    }
  }
}
```

---

### 1.4 ویرایش پروفایل کاربر
- **Method:** `PUT`
- **Endpoint:** `/api/auth/profile`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "name": "نام جدید (اختیاری)",
  "phone": "09129876543 (اختیاری)",
  "avatar": "https://url-to-avatar.png (اختیاری)",
  "address": "آدرس جدید (اختیاری)"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "پروفایل با موفقیت ویرایش شد",
  "data": {
    "user": {
      "_id": "64ebd3a51f2a4c11b0e98ca9",
      "name": "نام جدید",
      "phone": "09129876543",
      "role": "user",
      "avatar": "https://...",
      "address": "آدرس جدید"
    }
  }
}
```

---

### 1.5 تغییر رمز عبور
- **Method:** `PUT`
- **Endpoint:** `/api/auth/change-password`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecretPassword456"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "رمز عبور با موفقیت تغییر کرد"
}
```

---

## 2. محصولات (Products API) - `/api/products`

### 2.1 لیست محصولات با فیلتر و صفحه‌بندی
- **Method:** `GET`
- **Endpoint:** `/api/products`
- **Auth:** Public
- **Query Parameters:**
  - `page`: شماره صفحه (پیش‌فرض: `1`)
  - `limit`: تعداد در صفحه (پیش‌فرض: `12`)
  - `category`: دسته‌بندی
  - `search`: متن جستجو
  - `sort`: مرتب‌سازی (`newest`, `cheapest`, `expensive`, `popular`, `rating`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "لیست محصولات با موفقیت دریافت شد",
  "data": {
    "products": [
      {
        "_id": "64ebd3a51f2a4c11b0e98cb1",
        "title": "گوشی سامسونگ گلکسی S24",
        "price": 55000000,
        "discount": 10,
        "finalPrice": 49500000,
        "count": 15,
        "category": "موبایل",
        "image": "https://.../uploads/products/s24.jpg",
        "imageUrl": "https://.../uploads/products/s24.jpg",
        "fullImageUrl": "https://.../uploads/products/s24.jpg",
        "rating": 4.8,
        "numReviews": 12,
        "isAmazing": false,
        "createdAt": "2026-08-28T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 12,
      "totalPages": 1
    }
  }
}
```

---

### 2.2 جزئیات یک محصول با شناسه
- **Method:** `GET`
- **Endpoint:** `/api/products/:id`
- **Auth:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "اطلاعات محصول دریافت شد",
  "data": {
    "product": {
      "_id": "64ebd3a51f2a4c11b0e98cb1",
      "title": "گوشی سامسونگ گلکسی S24",
      "description": "توضیحات کامل محصول",
      "price": 55000000,
      "discount": 10,
      "finalPrice": 49500000,
      "count": 15,
      "category": "موبایل",
      "image": "https://.../uploads/products/s24.jpg",
      "imageUrl": "https://.../uploads/products/s24.jpg",
      "rating": 4.8,
      "numReviews": 12
    }
  }
}
```

---

### 2.3 ایجاد محصول جدید (مخصوص مدیر)
- **Method:** `POST`
- **Endpoint:** `/api/products`
- **Auth:** Bearer Token (Role: `admin`)
- **Body Type:** `multipart/form-data` یا `application/json` (با `imageBase64`)
- **Request Body (JSON یا Form Fields):**
```json
{
  "title": "هدفون بلوتوثی سونی",
  "description": "هدفون نویز کنسلینگ عالی",
  "price": 12000000,
  "discount": 15,
  "count": 20,
  "category": "صوتی",
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD... (یا آپلود فایل در فیلد image)",
  "isAmazing": true
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "محصول جدید با موفقیت ثبت شد",
  "data": {
    "product": {
      "_id": "64ebd3a51f2a4c11b0e98cb2",
      "title": "هدفون بلوتوثی سونی",
      "price": 12000000,
      "discount": 15,
      "finalPrice": 10200000,
      "count": 20,
      "image": "https://.../uploads/products/headphone.jpg",
      "imageUrl": "https://.../uploads/products/headphone.jpg"
    }
  }
}
```

---

### 2.4 ویرایش محصول (مخصوص مدیر)
- **Method:** `PUT`
- **Endpoint:** `/api/products/:id`
- **Auth:** Bearer Token (Role: `admin`)
- **Request Body:** فیلدهای قابل ویرایش (مانند `price`, `count`, `discount`, `title`, `image`)

---

### 2.5 حذف محصول (مخصوص مدیر)
- **Method:** `DELETE`
- **Endpoint:** `/api/products/:id`
- **Auth:** Bearer Token (Role: `admin`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "محصول با موفقیت حذف شد"
}
```

---

## 3. محصولات شگفت‌انگیز (Amazing Products) - `/api/amazing-products`

- **GET `/api/amazing-products`**: دریافت تمامی محصولات دارای تخفیف شگفت‌انگیز (Public)
- **GET `/api/amazing-products/:id`**: دریافت جزئیات محصول شگفت‌انگیز (Public)
- **POST `/api/amazing-products`**: ایجاد محصول شگفت‌انگیز جدید (Admin)
- **PUT `/api/amazing-products/:id`**: ویرایش محصول شگفت‌انگیز (Admin)
- **DELETE `/api/amazing-products/:id`**: حذف محصول شگفت‌انگیز (Admin)

---

## 4. اسلایدر و بنرها (Slides API) - `/api/slides`

### 4.1 دریافت لیست همه اسلایدها
- **Method:** `GET`
- **Endpoint:** `/api/slides`
- **Auth:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "اسلایدرها با موفقیت دریافت شدند",
  "data": [
    {
      "_id": "64ebd3a51f2a4c11b0e98ca9",
      "image": "https://.../uploads/slides/slide-1.jpg",
      "imageUrl": "https://.../uploads/slides/slide-1.jpg",
      "fullImageUrl": "https://.../uploads/slides/slide-1.jpg",
      "createdAt": "2026-08-28T12:00:00.000Z"
    }
  ]
}
```

---

### 4.2 ایجاد اسلاید جدید (مخصوص مدیر)
- **Method:** `POST`
- **Endpoint:** `/api/slides`
- **Auth:** Bearer Token (Role: `admin`)
- **Request Body (JSON یا Multipart Form):**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```
*یا ارسال فایل فیزیکی در فیلد فرم با نام `image`.*

- **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "اسلاید جدید با موفقیت ایجاد شد",
  "data": {
    "_id": "64ebd3a51f2a4c11b0e98ca9",
    "image": "https://.../uploads/slides/slide-cb92a7f8.jpg",
    "imageUrl": "https://.../uploads/slides/slide-cb92a7f8.jpg",
    "fullImageUrl": "https://.../uploads/slides/slide-cb92a7f8.jpg"
  }
}
```

---

### 4.3 حذف اسلاید (مخصوص مدیر)
- **Method:** `DELETE`
- **Endpoint:** `/api/slides/:id`
- **Auth:** Bearer Token (Role: `admin`)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "اسلاید حذف گردید",
  "data": {
    "id": "64ebd3a51f2a4c11b0e98ca9"
  }
}
```

---

## 5. سبد خرید (Cart API) - `/api/cart`

- **Auth:** عمومی / احراز هویت شده (با ارسال `Authorization: Bearer <TOKEN>` سبد به حساب کاربر متصل می‌شود).

### 5.1 مشاهده سبد خرید
- **Method:** `GET`
- **Endpoint:** `/api/cart`
- **Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "cart": {
      "items": [
        {
          "productId": "64ebd3a51f2a4c11b0e98cb1",
          "title": "گوشی سامسونگ گلکسی S24",
          "price": 55000000,
          "discount": 10,
          "finalPrice": 49500000,
          "quantity": 2,
          "totalItemPrice": 99000000,
          "image": "https://.../uploads/products/s24.jpg"
        }
      ],
      "totalQuantity": 2,
      "totalAmount": 110000000,
      "totalDiscount": 11000000,
      "payableAmount": 99000000
    }
  }
}
```

---

### 5.2 افزودن کالا به سبد خرید
- **Method:** `POST`
- **Endpoint:** `/api/cart/items`
- **Request Body:**
```json
{
  "productId": "64ebd3a51f2a4c11b0e98cb1",
  "quantity": 1
}
```

---

### 5.3 تغییر تعداد کالای موجود در سبد خرید
- **Method:** `PUT`
- **Endpoint:** `/api/cart/items/:productId`
- **Request Body:**
```json
{
  "quantity": 3
}
```

---

### 5.4 حذف کالا از سبد خرید
- **Method:** `DELETE`
- **Endpoint:** `/api/cart/items/:productId`

---

### 5.5 خالی کردن کامل سبد خرید
- **Method:** `DELETE`
- **Endpoint:** `/api/cart`

---

## 6. سفارشات و پرداخت (Orders API) - `/api/orders`

### 6.1 ثبت سفارش جدید
- **Method:** `POST`
- **Endpoint:** `/api/orders`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "items": [
    {
      "productId": "64ebd3a51f2a4c11b0e98cb1",
      "quantity": 2
    }
  ],
  "shippingAddress": "تهران، میدان ونک، پلاک ۱۲",
  "paymentMethod": "online"
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "سفارش با موفقیت ثبت شد",
  "data": {
    "order": {
      "_id": "64ebd3a51f2a4c11b0e98cc3",
      "orderNumber": "ORD-17878934-892",
      "user": "64ebd3a51f2a4c11b0e98ca9",
      "items": [],
      "totalAmount": 99000000,
      "status": "pending",
      "isPaid": false,
      "shippingAddress": "تهران، میدان ونک، پلاک ۱۲",
      "createdAt": "2026-08-28T12:00:00.000Z"
    }
  }
}
```

---

### 6.2 دریافت لیست سفارشات من
- **Method:** `GET`
- **Endpoint:** `/api/orders`
- **Auth:** Bearer Token

---

### 6.3 پرداخت سفارش
- **Method:** `POST`
- **Endpoint:** `/api/orders/:id/pay`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "transactionId": "TRX-9988771122 (اختیاری)"
}
```
- **Success Response (200 OK):** وضعیت سفارش به `processing` و `isPaid: true` تغییر می‌یابد.

---

### 6.4 تغییر وضعیت سفارش (مخصوص مدیر)
- **Method:** `PUT`
- **Endpoint:** `/api/orders/:id/status`
- **Auth:** Bearer Token (Role: `admin`)
- **Request Body:**
```json
{
  "status": "shipped"
}
```
*(مقادیر مجاز: `pending`, `processing`, `shipped`, `delivered`, `cancelled`)*

---

## 7. نظرات و دیدگاه‌ها (Reviews API) - `/api/reviews`

### 7.1 مشاهده نظرات یک محصول
- **Method:** `GET`
- **Endpoint:** `/api/reviews?productId=:productId`
- **Auth:** Public

---

### 7.2 ثبت نظر جدید برای محصول
- **Method:** `POST`
- **Endpoint:** `/api/reviews`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "productId": "64ebd3a51f2a4c11b0e98cb1",
  "rating": 5,
  "comment": "کیفیت ساخت فوق‌العاده و ارسال به موقع بود."
}
```

---

### 7.3 پاسخ مدیر به نظر (مخصوص مدیر)
- **Method:** `POST`
- **Endpoint:** `/api/reviews/:id/reply`
- **Auth:** Bearer Token (Role: `admin`)
- **Request Body:**
```json
{
  "reply": "ممنون از نظر ارزشمند شما کاربر گرامی."
}
```

---

### 7.4 حذف نظر (مخصوص مدیر)
- **Method:** `DELETE`
- **Endpoint:** `/api/reviews/:id`
- **Auth:** Bearer Token (Role: `admin`)

---

## 8. پنل مدیریت (Admin API) - `/api/admin`

- **Auth:** Bearer Token (Role: `admin`)

- **GET `/api/admin/dashboard`**: دریافت آمار کلی داشبورد (تعداد سفارشات، درآمد کل، تعداد کاربران، آمار محصولات).
- **GET `/api/admin/users`**: لیست تمامی کاربران با قابلیت فیلتر و جستجو.
- **PUT `/api/admin/users/:id/role`**: تغییر نقش کاربر:
  ```json
  { "role": "admin" }
  ```
- **PUT `/api/admin/users/:id/toggle-status`**: مسدود یا فعال‌سازی کاربر (`isActive`).
- **GET `/api/admin/orders`**: لیست تمامی سفارشات ثبت‌شده در سیستم.

---

## 9. بررسی سلامت سرور (Health Check)
- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Auth:** Public
- **Response:**
```json
{
  "status": "healthy",
  "uptime": 120.45,
  "timestamp": "2026-08-28T12:00:00.000Z"
}
```
