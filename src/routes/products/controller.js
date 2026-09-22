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
