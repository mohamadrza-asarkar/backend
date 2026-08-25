import bcrypt from 'bcryptjs';

export const initialSlides = [
  {
    _id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=1600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1600&q=80',
    createdAt: new Date().toISOString()
  }
];

export const initialReviews = [
  {
    _id: 'rev-1',
    productId: 'prod-1',
    sender: 'علیرضا رضایی',
    comment: 'عطر و ری این برنج هاشمی فوق‌العاده است. پخت بسیار مجلسی و دانه‌بلند دارد.',
    text: 'عطر و ری این برنج هاشمی فوق‌العاده است. پخت بسیار مجلسی و دانه‌بلند دارد.',
    rating: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    _id: 'rev-2',
    productId: 'prod-2',
    sender: 'سارا تهرانی',
    comment: 'برای شله زرد و سوپ و مصرف روزانه خانواده، نیم دانه هاشمی کیفیت عالی و عطر بی‌نظیری داشت.',
    text: 'برای شله زرد و سوپ و مصرف روزانه خانواده، نیم دانه هاشمی کیفیت عالی و عطر بی‌نظیری داشت.',
    rating: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    _id: 'rev-3',
    productId: 'prod-3',
    sender: 'مهدی حسینی',
    comment: 'ریزدانه کاملا بوجار شده و تمیز بود، بدون سنگریزه و با عطر اصیل طارم شمال.',
    text: 'ریزدانه کاملا بوجار شده و تمیز بود، بدون سنگریزه و با عطر اصیل طارم شمال.',
    rating: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

export const initialProducts = [
  {
    _id: 'prod-1',
    name: 'برنج طارم هاشمی درجه یک گیلان (کیسه ۱۰ کیلوگرمی)',
    description: 'برنج اعلا و ممتاز طارم هاشمی کشت اول استان گیلان، کاملاً بوجار و سورت شده، دانه بلند با عطر و قدکشیدن فوق‌العاده مناسب مهمانی‌ها و مجالس.',
    price: 1350000,
    isAvailable: true,
    countInStock: 45,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    reviews: [initialReviews[0]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-2',
    name: 'برنج طارم محلی فریدونکنار (کیسه ۱۰ کیلوگرمی)',
    description: 'برنج اصیل طارم محلی فریدونکنار مازندران با عطر و طعم سنتی، پخت بسیار نرم و ماندگاری بالا حتی پس از گرم شدن مجدد.',
    price: 1420000,
    isAvailable: true,
    countInStock: 30,
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80',
    reviews: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-3',
    name: 'نیم دانه برنج هاشمی معطر اعلا (کیسه ۱۰ کیلوگرمی)',
    description: 'نیم دانه مرغوب و خالص برنج هاشمی گیلان، تمیز و بدون ناخالصی، با همان عطر و طعم برنج دانه بلند، بسیار اقتصادی و مناسب پخت آش، شله زرد، دسر و مصرف روزمره خانگی.',
    price: 680000,
    isAvailable: true,
    countInStock: 25,
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
    reviews: [initialReviews[1]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-4',
    name: 'نیم دانه برنج طارم محلی مازندران (کیسه ۵ کیلوگرمی)',
    description: 'نیم دانه باکیفیت و خوش‌پخت طارم فریدونکنار، کاملاً الک شده، طعم و عطر بی‌نظیر برای پخت انواع غذاهای سنتی و سوپ.',
    price: 350000,
    isAvailable: true,
    countInStock: 18,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
    reviews: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-5',
    name: 'ریز دانه برنج (لاشه و سرلاشه) هاشمی اعلا (کیسه ۱۰ کیلوگرمی)',
    description: 'ریز دانه و سرلاشه تمیز برنج هاشمی با دانه‌های ۳/۴ و خرد شده تمیز، بدون ضایعات، بسیار خوش‌طعم، عطردار و مقرون‌به‌صرفه.',
    price: 520000,
    isAvailable: true,
    countInStock: 15,
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80',
    reviews: [initialReviews[2]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-6',
    name: 'ریز دانه برنج طارم عطری (کیسه ۵ کیلوگرمی)',
    description: 'دانه ریز و لاشه برنج طارم دانه ریز بوجار شده، مناسب کته و پخت خانگی روزانه با قیمت عالی.',
    price: 270000,
    isAvailable: false,
    countInStock: 0,
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
    reviews: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialOrders = [
  {
    _id: 'ord-1001',
    orderNumber: 'ORD-98421',
    userId: 'user-customer-1',
    buyerName: 'علیرضا رضایی',
    address: 'تهران، بلوار کشاورز، خیابان فلسطین شمالی، کوچه یکم، پلاک ۱۲',
    phone: '09351112233',
    products: [
      {
        product: {
          _id: 'prod-1',
          name: 'برنج طارم هاشمی درجه یک گیلان (کیسه ۱۰ کیلوگرمی)',
          price: 1350000,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80'
        },
        productId: 'prod-1',
        name: 'برنج طارم هاشمی درجه یک گیلان (کیسه ۱۰ کیلوگرمی)',
        price: 1350000,
        quantity: 2
      },
      {
        product: {
          _id: 'prod-3',
          name: 'نیم دانه برنج هاشمی معطر اعلا (کیسه ۱۰ کیلوگرمی)',
          price: 680000,
          image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=80'
        },
        productId: 'prod-3',
        name: 'نیم دانه برنج هاشمی معطر اعلا (کیسه ۱۰ کیلوگرمی)',
        price: 680000,
        quantity: 1
      }
    ],
    totalPrice: 3380000,
    status: 'delivered',
    paymentMethod: 'online',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    _id: 'ord-1002',
    orderNumber: 'ORD-98422',
    userId: 'user-customer-2',
    buyerName: 'سارا تهرانی',
    address: 'اصفهان، خیابان چهارباغ بالا، کوچه نگین، پلاک ۴',
    phone: '09199988776',
    products: [
      {
        product: {
          _id: 'prod-5',
          name: 'ریز دانه برنج (لاشه و سرلاشه) هاشمی اعلا (کیسه ۱۰ کیلوگرمی)',
          price: 520000,
          image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&q=80'
        },
        productId: 'prod-5',
        name: 'ریز دانه برنج (لاشه و سرلاشه) هاشمی اعلا (کیسه ۱۰ کیلوگرمی)',
        price: 520000,
        quantity: 2
      }
    ],
    totalPrice: 1040000,
    status: 'processing',
    paymentMethod: 'online',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  }
];

export async function createInitialUsers() {
  const adminPasswordHash = await bcrypt.hash('admin123456', 10);
  const userPasswordHash = await bcrypt.hash('user123456', 10);

  return [
    {
      _id: 'user-admin-1',
      name: 'مدیر کل سیستم (Admin)',
      email: 'admin@store.ir',
      password: adminPasswordHash,
      role: 'admin',
      phone: '09120000000',
      address: 'تهران، خیابان ولیعصر، پلاک ۱۱۰',
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'user-customer-1',
      name: 'علیرضا رضایی',
      email: 'user@store.ir',
      password: userPasswordHash,
      role: 'user',
      phone: '09351112233',
      address: 'تهران، بلوار کشاورز، خیابان فلسطین شمالی، کوچه یکم، پلاک ۱۲',
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'user-customer-2',
      name: 'سارا تهرانی',
      email: 'sara@example.com',
      password: userPasswordHash,
      role: 'user',
      phone: '09199988776',
      address: 'اصفهان، خیابان چهارباغ بالا، کوچه نگین، پلاک ۴',
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}
