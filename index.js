import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/routes/index.js';
import { db } from './src/models/db.js';
import { requestLogger } from './src/middlewares/logger.middleware.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;

// CORS - تمامی دامنه‌ها، متدها و هدرها کاملاً آزاد هستند
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Static uploads folder for Multer
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'فروشگاه برنج، نیم دانه و ریز دانه برنج (REST API)',
    status: 'online',
    version: '1.0.0',
    cors: 'All domains allowed (*)',
    documentation: {
      openapi: '/api/docs/openapi.json',
      postman: '/api/docs/postman.json',
      health: '/api/health'
    },
    endpoints: {
      slides: '/api/slides',
      products: '/api/products',
      search: '/api/products/search?q=هاشمی',
      cart: '/api/cart',
      orders: '/api/orders',
      reviews: '/api/reviews',
      auth: '/api/auth',
      admin: '/api/admin'
    }
  });
});

// نقطه اتصال روتر اصلی به برنامه
app.use('/api', apiRouter);

// مدیریت ۴۰۴ و خطاها
app.use(notFoundHandler);
app.use(errorHandler);

// اجرای سرور و راه‌اندازی دیتابیس
export async function startServer() {
  try {
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
