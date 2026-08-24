import bcrypt from 'bcryptjs';

export const initialCategories = [
  {
    _id: 'cat-1',
    name: 'موبایل و تبلت',
    slug: 'mobile-tablet',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    description: 'انواع گوشی‌های هوشمند، تبلت و لوازم جانبی دیجیتال',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat-2',
    name: 'لپ‌تاپ و کامپیوتر',
    slug: 'laptop-pc',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
    description: 'لپ‌تاپ‌های گیمینگ، اداری و مهندسی',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat-3',
    name: 'ساعت هوشمند و گجت',
    slug: 'wearables',
    icon: 'Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    description: 'ساعت‌های هوشمند، مچ‌بندهای سلامتی و لوازم هوشمند',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat-4',
    name: 'هدفون و تجهیزات صوتی',
    slug: 'audio',
    icon: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    description: 'هدفون‌های بیسیم، اسپیکر بلوتوثی و هدست گیمینگ',
    createdAt: new Date().toISOString()
  }
];

export const initialSlides = [
  {
    _id: 'slide-1',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&q=80',
    createdAt: new Date().toISOString()
  }
];

export const initialReviews = [
  {
    _id: 'rev-1',
    productId: 'prod-1',
    sender: 'علیرضا رضایی',
    comment: 'کیفیت دوربین فوق‌العاده است و بدنه تیتانیومی وزن گوشی را بسیار سبک‌تر کرده است. عملکرد بی‌نظیری دارد.',
    text: 'کیفیت دوربین فوق‌العاده است و بدنه تیتانیومی وزن گوشی را بسیار سبک‌تر کرده است. عملکرد بی‌نظیری دارد.',
    rating: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString()
  },
  {
    _id: 'rev-2',
    productId: 'prod-2',
    sender: 'سارا تهرانی',
    comment: 'برای رندرهای سنگین ویدیویی و کدنویسی واقعا عالی عمل می‌کند. مصرف باتری هم به شدت بهینه است.',
    text: 'برای رندرهای سنگین ویدیویی و کدنویسی واقعا عالی عمل می‌کند. مصرف باتری هم به شدت بهینه است.',
    rating: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    _id: 'rev-3',
    productId: 'prod-3',
    sender: 'مهدی حسینی',
    comment: 'کیفیت تفکیک صدا و نویزکنسلینگ میکروفون بسیار باکیفیت است و برای مکالمه در محیط شلوغ عالی است.',
    text: 'کیفیت تفکیک صدا و نویزکنسلینگ میکروفون بسیار باکیفیت است و برای مکالمه در محیط شلوغ عالی است.',
    rating: 4,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  }
];

export const initialProducts = [
  {
    _id: 'prod-1',
    name: 'گوشی موبایل آیفون 15 پرو مکس - 256 گیگابایت',
    title: 'گوشی موبایل آیفون 15 پرو مکس - 256 گیگابایت',
    description: 'آیفون 15 پرو مکس با بدنه تیتانیومی سبک و مقاوم، چیپست قدرتمند A17 Pro و دوربین 48 مگاپیکسلی با زوم اپتیکال 5 برابری. درگاه Type-C و باتری با شارژدهی فوق‌العاده.',
    price: 84500000,
    isAvailable: true,
    countInStock: 12,
    category: 'موبایل و تبلت',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80'
    ],
    reviews: [initialReviews[0]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-2',
    name: 'لپ‌تاپ مک‌بوک پرو 16 اینچ M3 Max - 36GB / 1TB',
    title: 'لپ‌تاپ مک‌بوک پرو 16 اینچ M3 Max - 36GB / 1TB',
    description: 'لپ‌تاپ غول‌آسای اپل مجهز به پردازنده خیره‌کننده M3 Max با 16 هسته پردازشی و 40 هسته گرافیکی، مناسب سنگین‌ترین رندرهای ویدیو و پروژه‌های هوش مصنوعی و برنامه‌نویسی.',
    price: 179000000,
    isAvailable: true,
    countInStock: 5,
    category: 'لپ‌تاپ و کامپیوتر',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80'
    ],
    reviews: [initialReviews[1]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-3',
    name: 'هدفون بی‌سیم سونی مدل WH-1000XM5 نویز کنسلینگ',
    title: 'هدفون بی‌سیم سونی مدل WH-1000XM5 نویز کنسلینگ',
    description: 'هدفون پرچمدار سونی با دو پردازنده اختصاصی برای حذف نویز فعال (ANC)، ۸ میکروفون هوشمند، تفکیک صدای استثنایی و شارژدهی تا ۳۰ ساعت مداوم.',
    price: 17200000,
    isAvailable: true,
    countInStock: 15,
    category: 'هدفون و تجهیزات صوتی',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    ],
    reviews: [initialReviews[2]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod-4',
    name: 'ساعت هوشمند سامسونگ گلکسی واچ 6 کلاسیک 47mm',
    title: 'ساعت هوشمند سامسونگ گلکسی واچ 6 کلاسیک 47mm',
    description: 'حاشیه چرخان فیزیکی محبوب، سنجش ترکیب بدنی BIA، پایش پیشرفته خواب و استرس، ضد آب با استاندارد 5ATM و صفحه نمایش سوپر امولد پرنور.',
    price: 15300000,
    isAvailable: false,
    countInStock: 0,
    category: 'ساعت هوشمند و گجت',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
    ],
    reviews: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
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
          name: 'گوشی موبایل آیفون 15 پرو مکس - 256 گیگابایت',
          price: 84500000,
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80'
        },
        productId: 'prod-1',
        name: 'گوشی موبایل آیفون 15 پرو مکس - 256 گیگابایت',
        price: 84500000,
        quantity: 1
      },
      {
        product: {
          _id: 'prod-3',
          name: 'هدفون بی‌سیم سونی مدل WH-1000XM5 نویز کنسلینگ',
          price: 17200000,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
        },
        productId: 'prod-3',
        name: 'هدفون بی‌سیم سونی مدل WH-1000XM5 نویز کنسلینگ',
        price: 17200000,
        quantity: 1
      }
    ],
    totalPrice: 101700000,
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
          _id: 'prod-2',
          name: 'لپ‌تاپ مک‌بوک پرو 16 اینچ M3 Max - 36GB / 1TB',
          price: 179000000,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80'
        },
        productId: 'prod-2',
        name: 'لپ‌تاپ مک‌بوک پرو 16 اینچ M3 Max - 36GB / 1TB',
        price: 179000000,
        quantity: 1
      }
    ],
    totalPrice: 179000000,
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
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
      address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۱۰',
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
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
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
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
      address: 'اصفهان، خیابان چهارباغ بالا، کوچه نگین، پلاک ۴',
      isActive: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}
