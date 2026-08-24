import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  Box 
} from 'lucide-react';

export const DeploymentGuide = () => {
  const [copiedId, setCopiedId] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">راهنمای راه‌اندازی و اجرای مستقل بک‌اند (Standalone Backend Guide)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              دستورالعمل‌های کامل اجرای سرور Node.js JavaScript، کانتینرسازی Docker و استقرار در سرور ابری یا VPS
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Local Development */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-bold text-xs flex items-center justify-center">۱</span>
            <h3 className="font-bold text-white text-sm">راه‌اندازی در محیط توسعه محلی (Local Node.js)</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            برای اجرای مستقیم سرور در سیستم لوکال با جاوا اسکریپت خالص:
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>دستورات ترمینال:</span>
              <button
                onClick={() => copyCode('npm install\nnode index.js', 'step1')}
                className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
              >
                {copiedId === 'step1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>کپی</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-teal-300 overflow-x-auto">
{`# 1. نصب پکیج‌ها
npm install

# 2. کپی فایل تنظیمات محیطی
cp .env.example .env

# 3. اجرای مستقیم سرور اکسپرس (Node.js ES Modules)
node index.js`}
            </pre>
          </div>
        </div>

        {/* Step 2: Docker & Docker Compose */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">۲</span>
            <h3 className="font-bold text-white text-sm">اجرا با داکر کامپوز (Docker & MongoDB)</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            اجرای همزمان کانتینر سرور Express + دیتابیس MongoDB با داکر:
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>اجرای Docker Compose:</span>
              <button
                onClick={() => copyCode('docker compose up -d --build', 'step2')}
                className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
              >
                {copiedId === 'step2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>کپی</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 overflow-x-auto">
{`# بیلد و اجرای کانتینرها در پس‌زمینه
docker compose up -d --build

# مشاهده لاگ‌های سرور
docker compose logs -f api`}
            </pre>
          </div>
        </div>

        {/* Step 3: Production Deployment with PM2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center">۳</span>
            <h3 className="font-bold text-white text-sm">استقرار در سرور لینوکس (VPS / Production PM2)</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            مدیریت پروسه با PM2 جهت اجرای پایدار در پس‌زمینه:
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>دستورات PM2:</span>
              <button
                onClick={() => copyCode('npm install -g pm2\npm2 start index.js --name "ecommerce-backend"\npm2 save', 'step3')}
                className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 px-2 py-0.5 rounded cursor-pointer"
              >
                {copiedId === 'step3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>کپی</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-amber-300 overflow-x-auto">
{`# نصب سراسری PM2
npm install -g pm2

# اجرای سرور جاوا اسکریپت با نام مشخص
pm2 start index.js --name "ecommerce-backend"

# ذخیره تنظیمات جهت استارت خودکار پس از ریبوت سرور
pm2 startup
pm2 save`}
            </pre>
          </div>
        </div>

        {/* Step 4: Environment Variables */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">۴</span>
            <h3 className="font-bold text-white text-sm">متغیرهای محیطی کلیدی (.env)</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            فایل <code className="text-purple-300">.env</code> را بر روی سرور خود با مقادیر زیر تنظیم کنید:
          </p>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-purple-300 overflow-x-auto">
{`PORT=3000
NODE_ENV=production
JWT_SECRET=YOUR_SECURE_RANDOM_SECRET_KEY
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
CORS_ORIGIN=*`}
          </pre>
        </div>
      </div>
    </div>
  );
};
