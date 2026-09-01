# 📦 مستندات کامل سیستم ثبت سفارش، تایید رسید پرداخت و رهگیری پستی

این راهنما شامل تمام مشخصات، دیاگرام جریان، نقاط اتصال (Endpoints)، ساختار داده‌ها و نمونه کدهای فرانت‌اند برای **سیستم مدیریت سفارشات، ارسال و تایید فیش واریزی، و کد رهگیری مرسوله پستی اداره پست** است.

---

## 🎯 اصول و ویژگی‌های کلیدی سیستم سفارشات

1. **یکتایی کد رهگیری (تنها با کد رهگیری پستی):**
   - هیچ شماره پیگیری ثانویه یا کد تصادفی دیگری وجود ندارد.
   - **تنها کد رهگیری موجود در سامانه، همان «کد رهگیری مرسوله پستی» (`postTrackingCode`) است** که پس از تحویل مرسوله به اداره پست یا شرکت‌های پستی (مثلاً بارکد ۲۴ رقمی پست پیشتاز یا تیپاکس)، توسط **ادمین** به صورت دستی در پنل مدیریت برای سفارش ثبت می‌شود.

2. **سیستم آپلود و تایید رسید پرداخت (`paymentReceipt` & `verify-payment`):**
   - مشتری فیش واریز کارت‌به‌کارت/پایا را همزمان با ثبت سفارش یا پس از آن (با آپلود فایل تصویر یا Base64) ارسال می‌کند.
   - وضعیت سفارش به `payment_submitted` تغییر یافته و ادمین می‌تواند آن را تایید (`approved`) یا رد (`rejected`) کند.

3. **پیگیری سراسری توسط مشتری:**
   - مشتری در بخش پیگیری سفارشات با وارد کردن همان **کد رهگیری پستی** صادر شده، وضعیت و جزئیات سفارش را مشاهده می‌کند.

---

## 🔄 دیاگرام جریان چرخه سفارش (Order Lifecycle Workflow)

```
[مشتری] 🛒 انتخاب اقلام و رفتن به تسویه‌حساب
   │
   ▼
[مشتری] 📝 ثبت سفارش (POST /api/orders) ──► سفارش با وضعیت pending ثبت می‌شود
   │
   ├─► ارسال همزمان تصویر فیش بانکی (فایل یا Base64)
   │     یا
   └─► ارسال فیش بعد از ثبت سفارش (PUT /api/orders/:id/receipt)
   │
   ▼
[سیستم] ⏳ تغییر وضعیت به:
        • state = "payment_submitted"
        • paymentStatus = "submitted"
   │
   ▼
[ادمین] 🔍 بررسی فیش واریزی در پنل مدیریت (PUT /api/orders/:id/verify-payment)
   ├─── ❌ رد فیش (rejected): ثبت توضیحات در adminNote ──► وضعیت = pending
   └───  تایید فیش (approved): وضعیت = processing
   │
   ▼
[ادمین] 📦 آماده‌سازی بسته و تحویل به اداره پست
   │
   ▼
[ادمین] 🚚 ثبت دستی کد رهگیری پستی و ارسال (PUT /api/orders/:id/status)
        • state = "shipped"
        • postTrackingCode = "241098234509123891238912" (کد رهگیری مرسوله پستی)
        • adminNote = "بسته با پست پیشتاز ارسال شد"
   │
   ▼
[مشتری] 🔎 استعلام آنلاین با کد رهگیری پستی (GET /api/orders/track/:postTrackingCode)
```

---

## 📊 ساختار مدل سفارش در دیتابیس (Order Schema)

| نام فیلد | نوع داده | پیش‌فرض | توضیحات |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId / String | اتوماتیک | شناسه یکتای سفارش در دیتابیس |
| `postTrackingCode` | String | `""` | **کد رهگیری مرسوله اداره پست** (ثبت دستی توسط ادمین) |
| `name` | String | الزامی | نام و نام‌خانوادگی گیرنده |
| `phone` | String | الزامی | شماره موبایل گیرنده (۱۱ رقمی) |
| `address` | String | الزامی | نشانی پستی دقیق تحویل |
| `postalCode` | String | `""` | کد پستی ۱۰ رقمی گیرنده |
| `state` | String (Enum) | `'pending'` | وضعیت سفارش (`pending`, `payment_submitted`, `processing`, `shipped`, `delivered`, `cancelled`) |
| `paymentStatus` | String (Enum) | `'pending'` | وضعیت فیش پرداخت (`pending`, `submitted`, `approved`, `rejected`) |
| `paymentReceipt` | String | `""` | آدرس فایل تصویر رسید واریز در سرور |
| `paymentReceiptDate` | Date | `null` | تاریخ و ساعت ارسال فیش پرداخت |
| `adminNote` | String | `""` | یادداشت و توضیحات ادمین برای مشتری |
| `products` | Array | `[]` | لیست اقلام سفارش شامل نام، قیمت، تعداد |
| `totalPrice` | Number | `0` | مبلغ کل فاکتور (تومان) |
| `createdAt` / `updatedAt` | Date | تاریخ جاری | زمان ایجاد و آخرین به‌روزرسانی |

---

## 🔌 نقاط اتصال و APIهای مربوط به سفارشات

Base URL: `https://ais-dev-rpvkewlvjilhjnoamjgjvq-240344892228.europe-west1.run.app/api`

---

### ۱. ثبت سفارش جدید (Create Order)
ثبت سفارش با مشخصات مشتری و محصولات.

* **مسیر:** `POST /api/orders`
* **دسترسی:** کاربر لاگین شده (`Authorization: Bearer <TOKEN>`)
* **فرمت ارسال:** `multipart/form-data` یا `application/json`

#### نمونه درخواست JSON:
```json
{
  "name": "محمدرضا اسدی",
  "phone": "09121112233",
  "address": "تهران، میدان ونک، خیابان ملاصدرا، پلاک ۱۲",
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

#### نمونه پاسخ موفق (201 Created):
```json
{
  "success": true,
  "message": "سفارش با موفقیت ثبت شد",
  "data": {
    "_id": "6a95d484a5d7fc5f52b44914",
    "name": "محمدرضا اسدی",
    "phone": "09121112233",
    "address": "تهران، میدان ونک، خیابان ملاصدرا، پلاک ۱۲",
    "postalCode": "1991812345",
    "postTrackingCode": "",
    "state": "pending",
    "paymentStatus": "pending",
    "paymentReceipt": "",
    "paymentReceiptDate": null,
    "products": [
      {
        "name": "برنج طارم هاشمی درجه یک مازندران",
        "price": 210000,
        "quantity": 2
      }
    ],
    "totalPrice": 420000,
    "createdAt": "2026-09-01T15:48:03.338Z",
    "updatedAt": "2026-09-01T15:48:03.338Z"
  }
}
```

---

### ۲. ارسال رسید پرداخت برای سفارش (Upload Payment Receipt)
* **مسیر:** `PUT /api/orders/:id/receipt` یا `POST /api/orders/:id/receipt`
* **دسترسی:** کاربر لاگین شده صاحب سفارش یا ادمین
* **فرمت ارسال:** فرم‌دیتا با کلید فایل `receipt` یا JSON با فیلد `receiptImage` / `paymentReceipt`

#### نمونه پاسخ موفق (200 OK):
```json
{
  "success": true,
  "message": "رسید پرداخت با موفقیت ارسال شد و در انتظار تایید مدیریت است",
  "data": {
    "_id": "6a95d484a5d7fc5f52b44914",
    "state": "payment_submitted",
    "paymentStatus": "submitted",
    "paymentReceipt": "/uploads/receipts/receipt-1788203109-12345.jpg",
    "paymentReceiptDate": "2026-09-01T15:50:00.000Z"
  }
}
```

---

### ۳. بررسی و تایید یا رد رسید پرداخت توسط ادمین (Verify Payment)
* **مسیر:** `PUT /api/orders/:id/verify-payment`
* **دسترسی:** فقط مدیر سیستم (`isAdmin`)
* **بدنه درخواست (JSON):**
```json
{
  "status": "approved",
  "state": "processing",
  "adminNote": "رسید پرداخت بانکی تایید شد و سفارش وارد مرحله بسته‌بندی گردید."
}
```

---

### ۴. تغییر وضعیت سفارش و ثبت دستی کد رهگیری پستی توسط ادمین (Update Order & Post Tracking)
هنگامی که بسته آماده و به اداره پست تحویل داده شد، ادمین وضعیت را به `shipped` تغییر داده و کد رهگیری پستی صادر شده را ثبت می‌کند.

* **مسیر:** `PUT /api/orders/:id/status`
* **دسترسی:** فقط مدیر سیستم (`isAdmin`)
* **بدنه درخواست (JSON):**
```json
{
  "state": "shipped",
  "postTrackingCode": "241098234509123891238912",
  "adminNote": "مرسوله از طریق پست پیشتاز ارسال شد."
}
```

#### نمونه پاسخ موفق (200 OK):
```json
{
  "success": true,
  "message": "اطلاعات سفارش و کد رهگیری پستی با موفقیت توسط ادمین به‌روزرسانی شد",
  "data": {
    "_id": "6a95d484a5d7fc5f52b44914",
    "postTrackingCode": "241098234509123891238912",
    "state": "shipped",
    "adminNote": "مرسوله از طریق پست پیشتاز ارسال شد."
  }
}
```

---

### ۵. پیگیری سفارش با کد رهگیری پستی (Track Order by Postal Code)
مشتریان بدون نیاز به ورود، مستقیماً با کد رهگیری پستی سفارش خود را استعلام می‌کنند.

* **مسیر:** `GET /api/orders/track/:postTrackingCode`
* **دسترسی:** عمومی (بدون نیاز به توکن JWT)
* **پارامتر مسیر:** کد رهگیری پستی مرسوله (مثلاً `241098234509123891238912`) یا شناسه سفارش

#### نمونه پاسخ (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "6a95d484a5d7fc5f52b44914",
    "postTrackingCode": "241098234509123891238912",
    "name": "محمدرضا اسدی",
    "phone": "09121112233",
    "address": "تهران، میدان ونک، خیابان ملاصدرا، پلاک ۱۲",
    "postalCode": "1991812345",
    "state": "shipped",
    "paymentStatus": "approved",
    "paymentReceipt": "/uploads/receipts/receipt-1788203109-12345.jpg",
    "paymentReceiptDate": "2026-09-01T15:50:00.000Z",
    "products": [
      {
        "name": "برنج طارم هاشمی درجه یک مازندران",
        "price": 210000,
        "quantity": 2
      }
    ],
    "totalPrice": 420000,
    "adminNote": "مرسوله از طریق پست پیشتاز ارسال شد.",
    "createdAt": "2026-09-01T15:48:03.338Z",
    "updatedAt": "2026-09-01T16:00:00.000Z"
  }
}
```

---

### ۶. دریافت لیست سفارشات کاربر (Get My Orders)
* **مسیر:** `GET /api/orders`
* **دسترسی:** کاربر لاگین شده (برای ادمین تمام سفارشات و برای کاربر عادی فقط سفارشات خودش بازمی‌گردد)

---

### ۷. دریافت جزئیات یک سفارش با ID (Get Order By ID)
* **مسیر:** `GET /api/orders/:id`
* **دسترسی:** کاربر لاگین شده

---

## 💻 نمونه کدهای اتصال فرانت‌اند (Frontend Examples)

### ۱. پیگیری سفارش در صفحه رهگیری با کد پستی:
```javascript
async function trackOrderByPostalCode(postTrackingCode) {
  try {
    const res = await fetch(`https://ais-dev-rpvkewlvjilhjnoamjgjvq-240344892228.europe-west1.run.app/api/orders/track/${encodeURIComponent(postTrackingCode)}`);
    const json = await res.json();
    
    if (json.success) {
      console.log("اطلاعات سفارش:", json.data);
      console.log("کد رهگیری پستی مرسوله:", json.data.postTrackingCode);
      console.log("وضعیت سفارش:", json.data.state);
      return json.data;
    } else {
      alert(json.message || "سفارشی با این کد رهگیری پستی یافت نشد");
    }
  } catch (error) {
    console.error("خطا در ارتباط با سرور:", error);
  }
}
```

### ۲. ثبت کد رهگیری پستی توسط ادمین در پنل مدیریت:
```javascript
async function setPostalTrackingCode(orderId, postTrackingCode, adminToken) {
  const res = await fetch(`https://ais-dev-rpvkewlvjilhjnoamjgjvq-240344892228.europe-west1.run.app/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      state: "shipped",
      postTrackingCode: postTrackingCode,
      adminNote: "مرسوله تحویل اداره پست شد"
    })
  });

  return await res.json();
}
```

---

## 🏷️ راهنمای وضعیت‌ها (Status Guide)

### مقادیر وضعیت سفارش (`state`):
* `pending`: سفارش ثبت شده و در انتظار پرداخت یا ارسال فیش
* `payment_submitted`: فیش پرداخت ارسال شده و در انتظار بررسی مدیر
* `processing`: فیش تایید شده و سفارش در حال آماده‌سازی و بسته‌بندی
* `shipped`: مرسوله به اداره پست تحویل داده شده و کد رهگیری پستی ثبت شده است
* `delivered`: سفارش به دست مشتری رسیده است
* `cancelled`: سفارش لغو شده است

### مقادیر وضعیت رسید پرداخت (`paymentStatus`):
* `pending`: در انتظار ارسال فیش پرداخت
* `submitted`: فیش ارسال شده و منتظر بررسی ادمین
* `approved`: فیش پرداخت تایید شد
* `rejected`: فیش پرداخت رد شد
