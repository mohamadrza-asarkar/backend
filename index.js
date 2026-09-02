import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import apiRouter from './src/routes/index.js';
import { apiLimiter } from './src/middlewares/rateLimit.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rice_store';

// Trust reverse proxies
app.set('trust proxy', 1);

// CORS - تمامی دامنه‌ها، متدها و هدرها کاملاً آزاد هستند
app.use(cors());

// Body Parsers (Increased to 50mb to support large Base64 image uploads in JSON)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate Limiter
app.use('/api', apiLimiter);

// Static uploads and public asset folders (Publicly accessible without auth)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// نقطه اتصال روتر اصلی به برنامه
app.use('/api', apiRouter);

// مدیریت ۴۰۴ و خطاها
app.use(notFoundHandler);
app.use(errorHandler);

// اجرای سرور و اتصال به دیتابیس
export async function startServer() {
  try {
    // اتصال اجباری و واقعی به دیتابیس بدون هیچگونه Fallback
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to DB (Real MongoDB Instance)');

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    return server;
  } catch (error) {
    console.error('❌ Failed to connect to DB:', error.message);
    process.exit(1); // خروج از برنامه با کد خطا
  }
}

// اگر فایل مستقیما با node اجرا شود
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  startServer();
}

export default app;
