import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads directory inside public
const uploadDir = path.join(__dirname, '../../public/uploads/slides');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `slide-${uniqueSuffix}${ext}`);
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری (JPEG, PNG, WebP, GIF) مجاز هستند'), false);
  }
};

// Multer instance for slide image upload
export const uploadSlide = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter
});
