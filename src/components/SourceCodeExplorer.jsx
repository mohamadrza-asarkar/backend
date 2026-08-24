import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  File, 
  Copy, 
  Check, 
  Download, 
  ChevronRight, 
  Code2
} from 'lucide-react';

const BACKEND_FILES = [
  {
    path: 'index.js',
    name: 'index.js (نقطه ورود سرور در ریشه)',
    category: 'Root Core',
    language: 'javascript',
    code: `import dotenv from 'dotenv';
import { createApp } from './app.js';
import { db } from './src/models/db.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createApp();

async function startServer() {
  try {
    await db.init();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`🚀 Node.js Express REST API Server is running on http://localhost:\${PORT}\`);
      console.log(\`📡 Base API URL: http://localhost:\${PORT}/api\`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();`
  },
  {
    path: 'app.js',
    name: 'app.js (پیکربندی Express، میدلورها و روت‌ها در ریشه)',
    category: 'Root Core',
    language: 'javascript',
    code: `import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/index.js';
import { requestLogger } from './src/middlewares/logger.middleware.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestLogger);

  // Serve static files from 'public' folder
  app.use(express.static(path.join(__dirname, 'public')));

  // Mount modular API routers
  app.use('/api', apiRouter);

  // Error Handlers
  app.use('/api/*', notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;`
  },
  {
    path: 'src/routes/index.js',
    name: 'src/routes/index.js (روتر اصلی تجمیع‌کننده روت‌ها)',
    category: 'Routes Master',
    language: 'javascript',
    code: `import { Router } from 'express';
import authRoutes from './auth/index.js';
import productRoutes from './products/index.js';
import categoryRoutes from './categories/index.js';
import cartRoutes from './cart/index.js';
import orderRoutes from './orders/index.js';
import reviewRoutes from './reviews/index.js';
import slideRoutes from './slides/index.js';
import adminRoutes from './admin/index.js';
import docsRoutes from './docs/index.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/slides', slideRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/docs', docsRoutes);

export default apiRouter;`
  },
  {
    path: 'src/routes/auth/controller.js',
    name: 'src/routes/auth/controller.js (کنترلر احراز هویت)',
    category: 'Auth Route',
    language: 'javascript',
    code: `import { UserModel } from '../../models/user.model.js';
import { generateToken } from '../../utils/jwt.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    const existing = await UserModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 400, 'کاربری با این ایمیل قبلاً ثبت نام کرده است');
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
      role: role === 'admin' ? 'admin' : 'user'
    });

    const token = generateToken({ id: newUser._id, role: newUser.role, email: newUser.email });
    const { password: _, ...userWithoutPassword } = newUser;

    return successResponse(res, 201, 'ثبت‌نام با موفقیت انجام شد', {
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    next(error);
  }
};`
  },
  {
    path: 'src/routes/auth/validation.js',
    name: 'src/routes/auth/validation.js (ولیدیشن احراز هویت)',
    category: 'Auth Route',
    language: 'javascript',
    code: `export const validateRegister = (data = {}) => {
  const errors = {};
  const { name, email, password, phone } = data;

  if (!name || name.trim().length < 2) errors.name = 'نام و نام خانوادگی الزامی است';
  if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.email = 'ایمیل معتبر نیست';
  if (!password || password.length < 6) errors.password = 'رمز عبور حداقل ۶ کاراکتر باشد';
  if (phone && !/^09\\d{9}$/.test(phone)) errors.phone = 'شماره همراه معتبر نیست';

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};`
  },
  {
    path: 'src/middlewares/auth.middleware.js',
    name: 'src/middlewares/auth.middleware.js (میدلور گارد توکن JWT و نقش ادمین)',
    category: 'Middlewares',
    language: 'javascript',
    code: `import { verifyToken } from '../utils/jwt.js';
import { UserModel } from '../models/user.model.js';
import { errorResponse } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return errorResponse(res, 401, 'دسترسی غیرمجاز. لطفا توکن Bearer ارسال فرمایید');
    }

    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'حساب کاربری یافت نشد یا غیرفعال است');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'توکن نامعتبر یا منقضی شده است');
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 403, 'دسترسی غیرمجاز. این روت فقط مخصوص ادمین است');
  }
  next();
};`
  },
  {
    path: 'src/models/user.model.js',
    name: 'src/models/user.model.js (مدل کاربر با متدهای CRUD دیتابیس)',
    category: 'Models',
    language: 'javascript',
    code: `import { db } from './db.js';

export class UserModel {
  static async find(query = {}) {
    let results = [...db.users];
    if (query.role) results = results.filter(u => u.role === query.role);
    if (query.isActive !== undefined) results = results.filter(u => u.isActive === query.isActive);
    return results;
  }

  static async findById(id) {
    return db.users.find(u => u._id === id) || null;
  }

  static async findOne(query) {
    return db.users.find(u => Object.keys(query).every(key => u[key] === query[key])) || null;
  }

  static async create(data) {
    const newUser = {
      _id: \`user-\${Date.now()}-\${Math.random().toString(36).substr(2, 5)}\`,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    db.users.push(newUser);
    return newUser;
  }
}`
  }
];

export const SourceCodeExplorer = () => {
  const [selectedFile, setSelectedFile] = useState(BACKEND_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'code.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">سورس‌کد و ساختار ماژولار بک‌اند (Source Code Explorer)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مشاهده ساختار استاندارد جاوا اسکریپت با ریشه پروژه، کنترلرها، اعتبارسنجی‌ها، میدلورها و مدل‌ها
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Files Tree */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono border-b border-slate-800 pb-2">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>فایل‌های پروژه Node.js Express (JS)</span>
          </div>

          <div className="space-y-1">
            {BACKEND_FILES.map(f => {
              const isSelected = selectedFile.path === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-right p-2.5 rounded-xl border text-xs transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 text-blue-300 shadow-md font-mono'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/40 font-mono'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <File className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{f.path}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Code View */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-xs text-white font-bold">{selectedFile.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>کپی کد</span>
              </button>

              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود فایل</span>
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-blue-300 overflow-x-auto max-h-[500px] leading-relaxed">
            {selectedFile.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
