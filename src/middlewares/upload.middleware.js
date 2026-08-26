import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploadDir = path.join(__dirname, '../../public/uploads');
const slidesUploadDir = path.join(baseUploadDir, 'slides');
const productsUploadDir = path.join(baseUploadDir, 'products');

// Ensure upload directories exist
[baseUploadDir, slidesUploadDir, productsUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const slideStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(slidesUploadDir)) {
      fs.mkdirSync(slidesUploadDir, { recursive: true });
    }
    cb(null, slidesUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `slide-${uniqueSuffix}${ext}`);
  }
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(productsUploadDir)) {
      fs.mkdirSync(productsUploadDir, { recursive: true });
    }
    cb(null, productsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری (JPEG, PNG, WebP, GIF) مجاز هستند'), false);
  }
};

export const uploadSlide = multer({
  storage: slideStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
