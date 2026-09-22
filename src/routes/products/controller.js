import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../../models/product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تابع کمکی برای حذف فیزیکی فایل تصویر محصول از هاست
const deleteImageFile = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') return;
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
    const cleanPath = imagePath.replace(/^\//, '');
    const absolutePath = path.join(__dirname, '../../../public', cleanPath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log(`🗑️ Product image deleted: ${absolutePath}`);
      } catch (err) {
        console.error(`❌ Failed to delete product image: ${absolutePath}`, err.message);
      }
    }
  }
};

// دریافت لیست محصولات
export const getProducts = async (req, res) => {
  try {
    const { search, q, isAvailable, isAmazing } = req.query;
    const filter = {};
    if (search || q) filter.search = search || q;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    if (isAmazing !== undefined) filter.isAmazing = isAmazing;

    const products = await Product.find(filter);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// دریافت محصولات شگفت‌انگیز
export const getAmazingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAmazing: true });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// جستجوی محصول
export const searchProducts = async (req, res) => {
  try {
    const products = await Product.find({ search: req.query.q || '' });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// دریافت محصول با شناسه
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// افزودن محصول جدید (ادمین)
export const createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/products/${req.file.filename}`;
    
    // کست کردن مقادیر منطقی به بولین واقعی
    if (data.isAmazing !== undefined) {
      data.isAmazing = data.isAmazing === 'true' || data.isAmazing === true;
    }
    if (data.isAvailable !== undefined) {
      data.isAvailable = data.isAvailable === 'true' || data.isAvailable === true;
    }

    // تنظیم خودکار تاریخ انقضای شگفت‌انگیز (مانند ۲ روز یا چند ساعت آینده)
    if (data.isAmazing === true) {
      if (data.amazingDurationDays !== undefined) {
        const days = Number(data.amazingDurationDays) || 2;
        data.amazingExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      } else if (data.amazingDurationHours !== undefined) {
        const hours = Number(data.amazingDurationHours) || 48;
        data.amazingExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      } else if (!data.amazingExpiresAt) {
        // زمان پیش‌فرض: ۲ روز آینده
        data.amazingExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      }
    } else {
      data.amazingExpiresAt = null;
    }

    // کست کردن مقادیر عددی و محاسبه قیمت نهایی بر اساس درصد تخفیف ریاضی
    const inputPrice = Number(data.price) || 0;
    const discountPercent = Number(data.discountPercent) || 0;

    data.discountPercent = discountPercent;
    data.originalPrice = inputPrice; // قیمت اصلی همان قیمت ورودی اولیه است

    if (discountPercent > 0) {
      // فرمول ریاضی: کم کردن درصد تخفیف از قیمت ورودی اصلی برای محاسبه قیمت فروش نهایی
      data.price = Math.round(inputPrice - (inputPrice * discountPercent / 100));
    } else {
      data.price = inputPrice;
    }

    if (data.countInStock !== undefined) {
      data.countInStock = Number(data.countInStock) || 0;
    }

    const product = await Product.create(data);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ویرایش محصول (ادمین)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    const data = { ...req.body };
    if (req.file) {
      const newImage = `/uploads/products/${req.file.filename}`;
      // حذف تصویر قبلی محصول
      deleteImageFile(product.image);
      data.image = newImage;
    } else if (data.image && data.image !== product.image) {
      deleteImageFile(product.image);
    }

    // کست کردن مقادیر منطقی به بولین واقعی
    if (data.isAmazing !== undefined) {
      data.isAmazing = data.isAmazing === 'true' || data.isAmazing === true;
    }
    if (data.isAvailable !== undefined) {
      data.isAvailable = data.isAvailable === 'true' || data.isAvailable === true;
    }

    // تنظیم خودکار تاریخ انقضای شگفت‌انگیز (مانند ۲ روز یا چند ساعت آینده)
    const nextAmazingState = data.isAmazing !== undefined ? data.isAmazing : product.isAmazing;
    if (nextAmazingState === true) {
      if (data.amazingDurationDays !== undefined) {
        const days = Number(data.amazingDurationDays) || 2;
        data.amazingExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      } else if (data.amazingDurationHours !== undefined) {
        const hours = Number(data.amazingDurationHours) || 48;
        data.amazingExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      } else if (!product.amazingExpiresAt && !data.amazingExpiresAt) {
        // زمان پیش‌فرض: ۲ روز آینده
        data.amazingExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      }
    } else {
      data.amazingExpiresAt = null;
    }

    // کست کردن مقادیر عددی و محاسبه قیمت نهایی بر اساس درصد تخفیف ریاضی
    const inputPrice = data.price !== undefined ? Number(data.price) : product.originalPrice;
    const discountPercent = data.discountPercent !== undefined ? Number(data.discountPercent) : product.discountPercent;

    data.discountPercent = discountPercent;
    data.originalPrice = inputPrice; // قیمت اصلی همان قیمت ورودی است

    if (discountPercent > 0) {
      data.price = Math.round(inputPrice - (inputPrice * discountPercent / 100));
    } else {
      data.price = inputPrice;
    }

    if (data.countInStock !== undefined) {
      data.countInStock = Number(data.countInStock) || 0;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// حذف محصول (ادمین)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    // حذف فیزیکی تصویر محصول از هاست
    deleteImageFile(product.image);

    // حذف رکورد از دیتابیس
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'محصول و تصویر مربوطه با موفقیت حذف شد' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
