import React, { useState } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Lock, 
  Search, 
  Terminal, 
  ChevronRight, 
  Key, 
  Sparkles
} from 'lucide-react';

const ENDPOINTS = [
  // Authentication
  {
    id: 'auth-login-admin',
    category: 'احراز هویت (Auth)',
    method: 'POST',
    path: '/auth/login',
    title: 'ورود ادمین به سیستم',
    description: 'دریافت توکن JWT با دسترسی کامل مدیریت',
    authRequired: false,
    defaultBody: { email: 'admin@store.ir', password: 'admin123456' }
  },
  {
    id: 'auth-login-user',
    category: 'احراز هویت (Auth)',
    method: 'POST',
    path: '/auth/login',
    title: 'ورود کاربر عادی',
    description: 'ورود مشتری با صدور توکن دسترسی استاندارد',
    authRequired: false,
    defaultBody: { email: 'user@store.ir', password: 'user123456' }
  },
  {
    id: 'auth-register',
    category: 'احراز هویت (Auth)',
    method: 'POST',
    path: '/auth/register',
    title: 'ثبت نام کاربر جدید',
    description: 'ایجاد حساب کاربری با اعتبارسنجی ایمیل و هش Bcrypt',
    authRequired: false,
    defaultBody: {
      name: 'مهدی احمدی',
      email: 'mehdi@example.com',
      password: 'password123',
      phone: '09129876543'
    }
  },
  {
    id: 'auth-me',
    category: 'احراز هویت (Auth)',
    method: 'GET',
    path: '/auth/me',
    title: 'مشخصات کاربر جاری',
    description: 'دریافت پروفایل کاربر از روی توکن Bearer JWT',
    authRequired: true
  },
  {
    id: 'auth-update-profile',
    category: 'احراز هویت (Auth)',
    method: 'PUT',
    path: '/auth/profile',
    title: 'بروزرسانی مشخصات و آدرس',
    description: 'تغییر نام، شماره تماس یا آدرس پستی کاربر جاری',
    authRequired: true,
    defaultBody: {
      name: 'محمد رضایی (بروزرسانی شده)',
      phone: '09121112233',
      address: {
        province: 'تهران',
        city: 'تهران',
        postalCode: '1587965412',
        addressLine: 'خیابان مطهری، پلاک ۱۲'
      }
    }
  },

  // Products
  {
    id: 'products-list',
    category: 'محصولات (Products)',
    method: 'GET',
    path: '/products',
    title: 'لیست محصولات (با وضعیت موجودی و نظرات)',
    description: 'دریافت محصولات شامل اسم، توضیحات، قیمت، موجود بودن/نبودن و نظرات',
    authRequired: false,
    defaultParams: { page: '1', limit: '6', sortBy: 'newest', isAvailable: 'true' }
  },
  {
    id: 'products-single',
    category: 'محصولات (Products)',
    method: 'GET',
    path: '/products/prod-1',
    title: 'دریافت تکی محصول با نظرات',
    description: 'شامل اسم، توضیحات، قیمت، موجود بودن و لیست نظرات محصول',
    authRequired: false
  },
  {
    id: 'products-create',
    category: 'محصولات (Products)',
    method: 'POST',
    path: '/products',
    title: 'ایجاد محصول جدید (ادمین)',
    description: 'ثبت محصول شامل اسم، توضیحات، قیمت و وضعیت موجودی',
    authRequired: true,
    adminOnly: true,
    defaultBody: {
      name: 'هندزفری بی سیم سامسونگ گلکسی بادز 2 پرو',
      description: 'هندزفری با صدای ۲۴ بیتی Hi-Fi، فناوری ANC هوشمند و طراحی ارگونومیک ضد آب',
      price: 6800000,
      isAvailable: true,
      category: 'هدفون و تجهیزات صوتی',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'
    }
  },
  {
    id: 'products-update',
    category: 'محصولات (Products)',
    method: 'PUT',
    path: '/products/prod-1',
    title: 'ویرایش موجودی و اطلاعات محصول',
    description: 'تغییر اسم، قیمت، توضیحات یا موجود بودن (isAvailable)',
    authRequired: true,
    adminOnly: true,
    defaultBody: {
      isAvailable: true,
      price: 84500000,
      description: 'آیفون 15 پرو مکس با بدنه تیتانیومی مقاوم و چیپست قدرتمند A17 Pro'
    }
  },
  {
    id: 'products-delete',
    category: 'محصولات (Products)',
    method: 'DELETE',
    path: '/products/prod-4',
    title: 'حذف محصول',
    description: 'حذف محصول از دیتابیس',
    authRequired: true,
    adminOnly: true
  },

  // Categories
  {
    id: 'cat-list',
    category: 'دسته‌بندی‌ها (Categories)',
    method: 'GET',
    path: '/categories',
    title: 'لیست تمام دسته‌بندی‌ها',
    description: 'دریافت ساختار دسته‌ها به همراه تعداد محصولات و آیکون',
    authRequired: false
  },

  // Cart
  {
    id: 'cart-get',
    category: 'سبد خرید (Cart)',
    method: 'GET',
    path: '/cart',
    title: 'دریافت کارت / سبد خرید (چند محصول)',
    description: 'مشاهده اقلام سبد خرید شامل چند محصول با جزئیات و قیمت کل',
    authRequired: false
  },
  {
    id: 'cart-add-item',
    category: 'سبد خرید (Cart)',
    method: 'POST',
    path: '/cart/items',
    title: 'افزودن محصول به کارت',
    description: 'اضافه کردن محصول به کارت خرید',
    authRequired: false,
    defaultBody: {
      productId: 'prod-1',
      quantity: 1
    }
  },
  {
    id: 'cart-clear',
    category: 'سبد خرید (Cart)',
    method: 'DELETE',
    path: '/cart',
    title: 'خالی کردن کل کارت خرید',
    description: 'حذف تمامی محصولات از کارت جاری',
    authRequired: false
  },

  // Orders
  {
    id: 'orders-user-list',
    category: 'سفارشات (Orders)',
    method: 'GET',
    path: '/orders',
    title: 'لیست سفارشات',
    description: 'سفارشات ثبت شده شامل محصولات، نام خریدار، آدرس و شماره تلفن',
    authRequired: true
  },
  {
    id: 'orders-create',
    category: 'سفارشات (Orders)',
    method: 'POST',
    path: '/orders',
    title: 'ثبت سفارش جدید',
    description: 'ثبت سفارش شامل نام و نام خانوادگی خریدار، آدرس و تلفن',
    authRequired: true,
    defaultBody: {
      buyerName: 'علیرضا رضایی',
      address: 'تهران، بلوار کشاورز، خیابان فلسطین شمالی، کوچه یکم، پلاک ۱۲',
      phone: '09351112233',
      paymentMethod: 'online'
    }
  },

  // Reviews
  {
    id: 'reviews-product',
    category: 'نظرات (Reviews)',
    method: 'GET',
    path: '/reviews?productId=prod-1',
    title: 'نظرات ثبت شده برای محصول',
    description: 'مشاهده نظرات شامل فرستنده، متن نظر و امتیاز',
    authRequired: false
  },
  {
    id: 'reviews-create',
    category: 'نظرات (Reviews)',
    method: 'POST',
    path: '/reviews',
    title: 'ثبت نظر جدید',
    description: 'ثبت دیدگاه شامل فرستنده (sender)، متن (comment) و امتیاز (rating)',
    authRequired: true,
    defaultBody: {
      productId: 'prod-1',
      sender: 'علیرضا رضایی',
      comment: 'کیفیت دوربین و شارژدهی این دستگاه واقعا فوق‌العاده است.',
      rating: 5
    }
  },

  // Slides & Banners
  {
    id: 'slides-list',
    category: 'اسلایدرها (Slides)',
    method: 'GET',
    path: '/slides',
    title: 'دریافت اسلایدها (تصاویر)',
    description: 'لیست اسلایدها که هر اسلاید فقط یک تصویر است',
    authRequired: false
  },
  {
    id: 'slides-create',
    category: 'اسلایدرها (Slides)',
    method: 'POST',
    path: '/slides',
    title: 'ایجاد اسلاید جدید (با تصویر مالتر یا URL)',
    description: 'ذخیره اسلاید که فقط شامل یک تصویر است',
    authRequired: true,
    adminOnly: true,
    defaultBody: {
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80'
    }
  },

  // Admin Dashboard
  {
    id: 'admin-dashboard-stats',
    category: 'پنل مدیریت (Admin)',
    method: 'GET',
    path: '/admin/dashboard',
    title: 'آمار کلی داشبورد ادمین',
    description: 'مجموع فروش، تعداد کاربران، سفارشات در انتظار و آخرین فعالیت‌ها',
    authRequired: true,
    adminOnly: true
  },
  {
    id: 'admin-users-list',
    category: 'پنل مدیریت (Admin)',
    method: 'GET',
    path: '/admin/users',
    title: 'لیست تمام کاربران سیستم',
    description: 'مشاهده لیست کامل کاربران، نقش‌ها و وضعیت فعال بودن',
    authRequired: true,
    adminOnly: true
  },

  // System & Health
  {
    id: 'sys-health',
    category: 'سیستم و متاداده (System)',
    method: 'GET',
    path: '/health',
    title: 'سلامت سرور (Health Check)',
    description: 'بررسی پاسخگویی سرویس Express و اتصال دیتابیس',
    authRequired: false
  },
  {
    id: 'sys-metrics',
    category: 'سیستم و متاداده (System)',
    method: 'GET',
    path: '/docs/metrics',
    title: 'متریک‌های سرور و حافظه',
    description: 'میزان مصرف حافظه RAM، تعداد اسناد در هر کالکشن دیتابیس و آپتایم',
    authRequired: false
  },
  {
    id: 'sys-openapi',
    category: 'سیستم و متاداده (System)',
    method: 'GET',
    path: '/docs/openapi.json',
    title: 'مستندات OpenAPI 3.0 خام',
    description: 'دریافت فایل JSON استاندارد Swagger/OpenAPI برای ایمپورت در ابزارها',
    authRequired: false
  }
];

export const ApiWorkbench = ({ token, onSetToken }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [requestUrl, setRequestUrl] = useState(ENDPOINTS[0].path);
  const [requestMethod, setRequestMethod] = useState(ENDPOINTS[0].method);
  const [requestHeaders, setRequestHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [requestBody, setRequestBody] = useState(
    ENDPOINTS[0].defaultBody ? JSON.stringify(ENDPOINTS[0].defaultBody, null, 2) : ''
  );
  
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseDuration, setResponseDuration] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState({});
  const [copied, setCopied] = useState(false);

  // Group categories
  const categories = ['all', ...Array.from(new Set(ENDPOINTS.map(e => e.category)))];

  const filteredEndpoints = ENDPOINTS.filter(ep => {
    const matchesCat = activeCategory === 'all' || ep.category === activeCategory;
    const matchesSearch = ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ep.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setRequestMethod(ep.method);
    
    let url = ep.path;
    if (ep.defaultParams) {
      const qs = new URLSearchParams(ep.defaultParams).toString();
      url = `${ep.path}?${qs}`;
    }
    setRequestUrl(url);

    const headersObj = { 'Content-Type': 'application/json' };
    if (ep.authRequired && token) {
      headersObj['Authorization'] = `Bearer ${token}`;
    }
    setRequestHeaders(JSON.stringify(headersObj, null, 2));

    if (ep.defaultBody) {
      setRequestBody(JSON.stringify(ep.defaultBody, null, 2));
    } else {
      setRequestBody('');
    }
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    const startTime = performance.now();

    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(requestHeaders);
      } catch {
        parsedHeaders = { 'Content-Type': 'application/json' };
      }

      if (token && !parsedHeaders['Authorization'] && selectedEndpoint.authRequired) {
        parsedHeaders['Authorization'] = `Bearer ${token}`;
      }

      const options = {
        method: requestMethod,
        headers: parsedHeaders
      };

      if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && requestBody.trim()) {
        options.body = requestBody;
      }

      const fullUrl = `/api${requestUrl.startsWith('/') ? requestUrl : '/' + requestUrl}`;
      const res = await fetch(fullUrl, options);
      const endTime = performance.now();
      setResponseDuration(Math.round(endTime - startTime));
      setResponseStatus(res.status);

      const resHdrs = {};
      res.headers.forEach((val, key) => {
        resHdrs[key] = val;
      });
      setResponseHeaders(resHdrs);

      const json = await res.json().catch(() => ({ raw: 'Non-JSON Response' }));
      setResponseData(json);

      if (requestUrl.includes('/auth/login') && json.data?.token) {
        onSetToken(json.data.token, json.data.user);
      } else if (requestUrl.includes('/auth/login') && json.token) {
        onSetToken(json.token, json.user);
      }
    } catch (err) {
      setResponseStatus(500);
      setResponseData({ error: err.message || 'شبکه یا سرور پاسخ نداد' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    const creds = role === 'admin'
      ? { email: 'admin@store.ir', password: 'admin123456' }
      : { email: 'user@store.ir', password: 'user123456' };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      const data = await res.json();
      const userToken = data.data?.token || data.token;
      const userInfo = data.data?.user || data.user;
      if (userToken) {
        onSetToken(userToken, userInfo);
        try {
          const hdrs = JSON.parse(requestHeaders);
          hdrs['Authorization'] = `Bearer ${userToken}`;
          setRequestHeaders(JSON.stringify(hdrs, null, 2));
        } catch {
          setRequestHeaders(JSON.stringify({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }, null, 2));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getMethodBadgeClass = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'POST':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'PATCH':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (status >= 300 && status < 400) return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    if (status >= 400 && status < 500) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  const generateCurl = () => {
    let curl = `curl -X ${requestMethod} "http://localhost:3000/api${requestUrl}" \\\n`;
    try {
      const hdrs = JSON.parse(requestHeaders);
      for (const [k, v] of Object.entries(hdrs)) {
        curl += `  -H "${k}: ${v}" \\\n`;
      }
    } catch {
      curl += `  -H "Content-Type: application/json" \\\n`;
    }
    if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && requestBody) {
      curl += `  -d '${requestBody.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  const copyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner with 1-Click Auth Quick Presets */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white text-base">کاوشگر و کنسول اجرای زنده اندپوینت‌ها (Live API Runner)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            تمامی درخواست‌ها به طور زنده به سرور Node.js Express ارسال و کنترلرها، میدلورها و اعتبارسنجی‌ها به صورت ماژولار اجرا می‌شوند.
          </p>
        </div>

        {/* Quick Auth buttons */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">ورود سریع تستی:</span>
          <button
            onClick={() => handleQuickLogin('admin')}
            className="flex items-center gap-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>ورود ادمین (Admin)</span>
          </button>
          <button
            onClick={() => handleQuickLogin('user')}
            className="flex items-center gap-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>ورود کاربر عادی (User)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Endpoints List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="جستجوی اندپوینت یا مسیر..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'همه' : cat.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints listing */}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredEndpoints.map(ep => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => selectEndpoint(ep)}
                  className={`w-full text-right p-2.5 rounded-xl border transition flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/60 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getMethodBadgeClass(ep.method)}`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs text-slate-200 truncate">{ep.path}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{ep.title}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {ep.adminOnly ? (
                      <span title="فقط دسترسی ادمین" className="text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/30 text-[10px]">👑</span>
                    ) : ep.authRequired ? (
                      <Lock className="w-3 h-3 text-slate-400" title="نیاز به لاگین" />
                    ) : null}
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Interactive Request / Response Playground */}
        <div className="lg:col-span-8 space-y-4">
          {/* Selected Endpoint Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">{selectedEndpoint.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEndpoint.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedEndpoint.authRequired && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {selectedEndpoint.adminOnly ? 'نیازمند نقش ادمین (Admin Role)' : 'نیازمند Bearer JWT Token'}
                  </span>
                )}
              </div>
            </div>

            {/* URL & Method Bar */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <select
                value={requestMethod}
                onChange={e => setRequestMethod(e.target.value)}
                className={`bg-slate-950 font-mono font-bold text-xs px-3 py-2 rounded-xl border focus:outline-none ${getMethodBadgeClass(requestMethod)}`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>

              <div className="flex-1 flex items-center bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-emerald-500">
                <span className="text-slate-500 font-mono text-xs pr-1">/api</span>
                <input
                  type="text"
                  value={requestUrl}
                  onChange={e => setRequestUrl(e.target.value)}
                  className="w-full bg-transparent text-slate-200 font-mono text-xs focus:outline-none px-1"
                />
              </div>

              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-slate-950" />
                )}
                <span>ارسال درخواست (Send)</span>
              </button>
            </div>

            {/* Request Body & Headers Accordion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Request Headers */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>هدرهای درخواست (Headers JSON):</span>
                </label>
                <textarea
                  value={requestHeaders}
                  onChange={e => setRequestHeaders(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Request Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>بدنه درخواست (Request Body JSON):</span>
                  {['GET', 'DELETE'].includes(requestMethod) && (
                    <span className="text-[10px] text-slate-500">(برای متد {requestMethod} معمولاً خالی است)</span>
                  )}
                </label>
                <textarea
                  value={requestBody}
                  onChange={e => setRequestBody(e.target.value)}
                  placeholder="{}"
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-amber-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* cURL Generation Box */}
            <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-mono truncate max-w-[80%]">
                <code className="text-slate-300">{generateCurl().split('\n')[0]} ...</code>
              </span>
              <button
                onClick={copyCurl}
                className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی دستور cURL</span>
              </button>
            </div>
          </div>

          {/* Response Inspector Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">پاسخ سرور Express (Live Response)</h4>
              </div>

              {responseStatus !== null && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2.5 py-0.5 rounded-lg border font-bold ${getStatusBadge(responseStatus)}`}>
                    HTTP {responseStatus}
                  </span>
                  {responseDuration !== null && (
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                      ⏱️ {responseDuration} ms
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Response Content */}
            {responseData ? (
              <div className="space-y-3">
                <div className="relative">
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96 leading-relaxed">
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="absolute top-3 left-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2 py-1 rounded text-[11px] flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>کپی JSON</span>
                  </button>
                </div>

                {/* Response Headers Mini Table */}
                <details className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                  <summary className="cursor-pointer text-slate-400 font-mono">مشاهده هدرهای پاسخ سرور (Response Headers)</summary>
                  <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
                    {Object.entries(responseHeaders).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-cyan-300">{v}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                یک اندپوینت را انتخاب کنید و دکمه «ارسال درخواست» را بزنید تا خروجی زنده سرور نمایش داده شود.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
