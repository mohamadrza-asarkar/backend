# 🌾 راهنمای جامع معماری و توسعه پروژه (AI & Developer System Guide)

این سند مرجع رسمی و دقیق معماری، مدل‌های داده، قراردادهای ارتباطی (API Contracts) و استانداردهای توسعه بک‌اند **فروشگاه تخصصی برنج و مشتقات (برنج، نیم‌دانه و ریز‌دانه)** است تا هوش مصنوعی (AI) و توسعه‌دهندگان بتوانند بدون خطا پروژه را نگهداری، ویرایش و توسعه دهند.

---

## ۱. مشخصات کلیدی و ساختار فنی پروژه

- **محیط اجرا:** Node.js (v18+) با ساختار استاندارد **ES Modules** (`"type": "module"`)
- **فریم‌ورک اصلی:** Express.js
- **پایگاه داده:** **MongoDB** به همراه **Mongoose (ODM)** + قابلیت Fallback به حافظه داخلی (In-Memory Adapter)
- **احراز هویت:** شماره موبایل (Phone با فرمت ۱۱ رقمی `09xxxxxxxxx`) + کلمه عبور (Password هش شده با `bcryptjs`) + توکن‌های استاندارد **JWT**
- **آپلود فایل:** Multer (ذخیره تصاویر اسلایدها و محصولات در مسیر `public/uploads`)
- **امنیت و محدودیت نرخ:** `express-rate-limit` (۲۰۰ درخواست / ۱۵ دقیقه برای API و ۲۵ درخواست / ۱۵ دقیقه برای Auth)
- **سیاست CORS:** باز برای تمام دامنه‌ها (`*`) با متدهای `GET, POST, PUT, DELETE, OPTIONS`
- **حالت بدون دیتای پیش‌فرض (Zero-Seed):** دیتابیس در بدو راه‌اندازی خالی است و تمامی داده‌ها باید مستقیماً از فرانت‌اند / کلاینت ایجاد شوند.

---

## ۲. مدل‌ها و اسکیماهای داده (Mongoose Schemas)

تمامی مدل‌ها در پوشه `src/models/` قرار دارند:

### ۲.۱. مدل کاربر (`User`) - `src/models/user.js`
مدیریت هویت کاربران و مدیران بر پایه **شماره تلفن**:
```javascript
{
  name: { type: String, required: true, trim: true },       // نام و نام خانوادگی
  phone: { type: String, required: true, unique: true },    // شماره موبایل (فرمت: 09121234567)
  password: { type: String, required: true },               // رمز عبور هش‌شده
  role: { type: String, enum: ['admin', 'user'], default: 'user' }, // نقش کاربری
  address: { type: String, default: '' },                   // آدرس پیش‌فرض خریدار
  avatar: { type: String, default: '' },                    // آدرس تصویر پروفایل
  isActive: { type: Boolean, default: true }                // وضعیت فعال/غیرفعال بودن
}
```

### ۲.۲. مدل محصول (`Product`) - `src/models/product.js`
مدیریت انواع برنج درجه یک، نیم‌دانه برنج و ریزدانه برنج (لاشه و سرلاشه):
```javascript
{
  name: { type: String, required: true, trim: true },       // نام محصول (مثال: برنج طارم هاشمی گیلان)
  description: { type: String, default: '' },               // توضیحات پخت، عطر و مشخصات
  price: { type: Number, required: true, min: 0 },          // قیمت به تومان
  isAvailable: { type: Boolean, default: true },            // وضعیت موجودی در انبار
  countInStock: { type: Number, default: 0, min: 0 },       // تعداد موجودی
  image: { type: String, default: '' },                     // لینک تصویر یا مسیر آپلود شده
  reviews: [reviewSubSchema]                                // لیست دیدگاه‌های ثبت‌شده روی محصول
}
```

### ۲.۳. مدل اسلاید (`Slide`) - `src/models/slide.js`
اسلایدر بنرهای صفحه اصلی (هر اسلاید فقط یک تصویر `image` دارد):
```javascript
{
  image: { type: String, required: true },                  // آدرس تصویر (آپلود شده با Multer یا URL مستقیم)
  createdAt: { type: Date, default: Date.now }
}
```

### ۲.۴. مدل سبد خرید (`Cart`) - `src/models/cart.js`
سبد خرید کاربران یا کاربران مهمان:
```javascript
{
  userId: { type: String, default: 'guest' },
  products: [
    {
      productId: { type: String, required: true },
      name: { type: String },
      price: { type: Number, default: 0 },
      quantity: { type: Number, default: 1, min: 1 },
      totalPrice: { type: Number, default: 0 },
      image: { type: String }
    }
  ],
  totalPrice: { type: Number, default: 0 }
}
```

### ۲.۵. مدل سفارش (`Order`) - `src/models/order.js`
سفارش نهایی ثبت‌شده توسط خریدار:
```javascript
{
  orderNumber: { type: String },                            // شماره رهگیری سفارش (مثال: ORD-84920)
  userId: { type: String, default: 'guest-user' },
  buyerName: { type: String, required: true },              // نام و نام خانوادگی خریدار
  address: { type: String, required: true },                // آدرس کامل پستی خریدار
  phone: { type: String, required: true },                  // شماره تلفن همراه خریدار
  products: [orderProductSchema],                           // اقلام برنج خریداری شده
  totalPrice: { type: Number, required: true },             // مبلغ کل سفارش
  status: {                                                 // وضعیت سفارش
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: { type: String, default: 'online' },
  paymentStatus: { type: String, default: 'pending' },
  trackingCode: { type: String }
}
```

### ۲.۶. مدل دیدگاه و نظر (`Review`) - `src/models/review.js`
نظرات و بازخوردهای خریداران درباره عطر، طعم و پخت برنج:
```javascript
{
  productId: { type: String, required: true, index: true }, // شناسه محصول
  sender: { type: String, required: true },                 // نام ارسال‌کننده نظر
  comment: { type: String, required: true },                // متن دیدگاه
  rating: { type: Number, required: true, min: 1, max: 5 }, // امتیاز از ۱ تا ۵
  createdAt: { type: Date, default: Date.now }
}
```

---

## ۳. فهرست کامل اندپوینت‌های وب‌سرویس (API Endpoints)

پیشوند تمام مسیرها: `/api`

### ۳.۱. احراز هویت و حساب کاربری (`/api/auth`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `POST` | `/api/auth/register` | عمومی | ثبت‌نام با `{ name, phone, password, role? }` |
| `POST` | `/api/auth/login` | عمومی | ورود با `{ phone, password }` و دریافت JWT Token |
| `GET` | `/api/auth/me` | لاگین | دریافت پروفایل کاربر جاری |
| `PUT` | `/api/auth/profile` | لاگین | ویرایش مشخصات (نام، شماره تماس، آدرس، تصویر) |
| `PUT` | `/api/auth/change-password` | لاگین | تغییر رمز عبور با `{ currentPassword, newPassword }` |

### ۳.۲. اسلایدها (`/api/slides`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `GET` | `/api/slides` | عمومی | دریافت لیست تمامی اسلایدرهای صفحه اول |
| `POST` | `/api/slides` | Admin | ایجاد اسلاید جدید (آپلود عکس با فیلد `image` یا ارسال `{ image: "url" }`) |
| `DELETE` | `/api/slides/:id` | Admin | حذف اسلاید با شناسه |

### ۳.۳. محصولات برنج، نیم‌دانه و ریزدانه (`/api/products`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `GET` | `/api/products` | عمومی | لیست محصولات با پشتیبانی از `search`, `isAvailable`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit` |
| `GET` | `/api/products/search?q=هاشمی` | عمومی | جستجوی بلادرنگ در نام و توضیحات انواع برنج |
| `GET` | `/api/products/:id` | عمومی | دریافت اطلاعات کامل یک محصول به همراه نظرات |
| `POST` | `/api/products` | Admin | ایجاد محصول برنج جدید (JSON یا `multipart/form-data` با عکس) |
| `PUT` | `/api/products/:id` | Admin | ویرایش اطلاعات محصول برنج |
| `DELETE` | `/api/products/:id` | Admin | حذف محصول |

### ۳.۴. سبد خرید (`/api/cart`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `GET` | `/api/cart` | عمومی/کاربر | دریافت محتویات سبد خرید کاربر یا مهمان |
| `POST` | `/api/cart/items` | عمومی/کاربر | افزودن محصول به سبد با `{ productId, quantity }` |
| `PUT` | `/api/cart/items/:productId` | عمومی/کاربر | تغییر تعداد یک قلم در سبد خرید |
| `DELETE` | `/api/cart/items/:productId` | عمومی/کاربر | حذف یک قلم از سبد خرید |
| `DELETE` | `/api/cart` | عمومی/کاربر | خالی کردن کامل سبد خرید |

### ۳.۵. سفارشات (`/api/orders`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `POST` | `/api/orders` | عمومی/کاربر | ثبت سفارش با `{ buyerName, address, phone, products?, items? }` |
| `GET` | `/api/orders` | لاگین | دریافت سفارشات کاربر جاری |
| `GET` | `/api/orders/:id` | عمومی/کاربر | دریافت جزئیات یک سفارش با ID یا OrderNumber |
| `PUT` | `/api/orders/:id/status` | Admin | تغییر وضعیت سفارش (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) |
| `DELETE` | `/api/orders/:id` | Admin | لغو و حذف سفارش |

### ۳.۶. نظرات و دیدگاه‌ها (`/api/reviews`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `GET` | `/api/reviews?productId=xxx` | عمومی | دریافت نظرات ثبت شده برای یک محصول خاص |
| `POST` | `/api/reviews` | عمومی/کاربر | ثبت نظر با `{ productId, sender, comment, rating }` |
| `DELETE` | `/api/reviews/:id` | Admin | حذف نظر نامناسب |

### ۳.۷. پنل مدیریت (`/api/admin`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | دریافت آمار جامع، درآمد کل، سفارشات در انتظار، وضعیت فروش |
| `GET` | `/api/admin/users` | Admin | مشاهده لیست تمام کاربران سیستم |
| `PUT` | `/api/admin/users/:id/role` | Admin | ارتقا یا تنزل نقش کاربر (`admin` / `user`) |
| `PUT` | `/api/admin/users/:id/toggle-status`| Admin | فعال/غیرفعال کردن دسترسی کاربر |
| `GET` | `/api/admin/orders` | Admin | مشاهده تمام سفارشات ثبت شده در کل سیستم |

### ۳.۸. مستندات زنده و ابزارها (`/api/docs`)
| متد | مسیر | دسترسی | توضیحات |
|---|---|---|---|
| `GET` | `/api/docs/openapi.json` | عمومی | خروجی استاندارد OpenAPI 3.0 جهت اتصال به Swagger |
| `GET` | `/api/docs/postman.json` | عمومی | کالکشن استاندارد Postman v2.1 آماده ایمپورت |
| `GET` | `/api/health` | عمومی | وضعیت سلامتی سرور، وضعیت اتصال Mongoose و حافظه |

---

## ۴. ساختار فایل‌ها و راهنمای اعمال تغییرات (Project Structure)

```
├── .env                  # متغیرهای محیطی (MONGODB_URI, JWT_SECRET, PORT)
├── index.js              # نقطه ورود و راه‌اندازی سرور Express، CORS، RateLimit و دیتابیس
├── package.json          # پکیج‌ها و اسکریپت‌ها
├── public/uploads/       # پوشه ذخیره فایل‌ها و عکس‌های آپلود شده
└── src/
    ├── config/
    │   └── database.js   # اتصال Mongoose به MongoDB با متد connectDB
    ├── middlewares/
    │   ├── auth.middleware.js       # بررسی JWT Bearer و دسترسی Admin
    │   ├── error.middleware.js      # هندلر مرکزی ارورها و خطاهای ۴۰۴
    │   ├── logger.middleware.js     # لاگر لاگ‌های درخواست‌ها
    │   ├── rateLimit.middleware.js  # محدودساز درخواست‌های سرور (Rate Limiter)
    │   ├── upload.middleware.js     # آپلودر Multer
    │   └── validate.middleware.js   # میدلور اعتبارسنجی ورودی‌ها
    ├── models/
    │   ├── db.js         # دیتابیس حافظه‌ای بدون دیتای هاردکد
    │   ├── user.js       # مدل کاربر (Phone + Password)
    │   ├── product.js    # مدل محصولات برنج
    │   ├── slide.js      # مدل اسلایدر
    │   ├── cart.js       # مدل سبد خرید
    │   ├── order.js      # مدل سفارشات
    │   ├── review.js     # مدل نظرات
    │   └── index.js      # Export مرکزی مدل‌ها
    ├── routes/
    │   ├── index.js      # روتر تجمیع‌کننده تمامی ماژول‌ها روی /api
    │   ├── auth/         # کنترلر و روت‌های احراز هویت با شماره تلفن
    │   ├── products/     # کنترلر، جستجو و فیلترینگ محصولات
    │   ├── slides/       # کنترلر و آپلود اسلایدها
    │   ├── cart/         # کنترلر سبد خرید
    │   ├── orders/       # کنترلر ثبت و پیگیری سفارشات
    │   ├── reviews/      # کنترلر دیدگاه‌ها و امتیازدهی
    │   ├── admin/        # کنترلر داشبورد و مدیریت کلان
    │   └── docs/         # مستندات OpenAPI، Postman و Health Check
    └── utils/
        ├── format.js     # توابع فرمت قیمت (تومان)، اعداد فارسی و تاریخ شمسی
        ├── jwt.js        # توابع ساخت و اعتبارسنجی JWT Token
        ├── password.js   # توابع هش و مقایسه رمز عبور با bcryptjs
        └── response.js   # فرمت استاندارد پاسخ‌های JSON سرور
```

---

## ۵. دستورالعمل ویژه برای هوش مصنوعی (AI Execution Rules)

هنگام ویرایش یا افزودن فیچرهای جدید توسط AI:
1. **احراز هویت فقط بر پایه `phone` و `password` است:** هرگز به سمت استفاده از email برنگردید. شماره تلفن شناسه اصلی کاربر است.
2. **عدم بازگردانی دیتای هاردکد (Zero Hardcoded Data):** هیچ فایل seed یا دیتای تستی در کد تزریق نکنید؛ تمام دیتابیس باید تمیز و از طریق API یا کلاینت پر شود.
3. **پایداری مدل‌ها (Mongoose + Memory Adapter):** هر فیلد یا قابلیت جدیدی که به مدل‌های Mongoose اضافه می‌شود، باید در متدهای Adapter (مانند `create`, `find`, `findByIdAndUpdate`) نیز پشتیبانی شود تا در هر دو حالت محیط توسعه و محیط پروداکشن بدون باگ کار کند.
4. **حفظ استانداردهای پاسخ سرور:** تمام پاسخ‌ها باید از طریق `successResponse(res, status, message, data)` و `errorResponse(res, status, message, error)` ارسال شوند.
