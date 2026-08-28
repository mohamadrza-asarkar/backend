import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/index.js';
import { db } from './src/models/db.js';
import { connectDB, isDBConnected } from './src/config/database.js';
import { requestLogger } from './src/middlewares/logger.middleware.js';
import { apiLimiter } from './src/middlewares/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies
app.set('trust proxy', 1);

// CORS - تمامی دامنه‌ها، متدها و هدرها کاملاً آزاد هستند
app.use(cors());

// Body Parsers (Increased to 50mb to support large Base64 image uploads in JSON)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(requestLogger);

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

// اجرای سرور و راه‌اندازی دیتابیس و مانگوس
export async function startServer() {
  try {
    // Connect to MongoDB via Mongoose
    await connectDB();
    // Initialize in-memory storage clean state
    await db.init();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Rice Store REST API server running on http://localhost:${PORT}`);
      console.log(`📡 Router mounted at http://localhost:${PORT}/api`);
    });
    return server;
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
}

// اگر فایل مستقیما با node اجرا شود
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  startServer();
}

export default app;
