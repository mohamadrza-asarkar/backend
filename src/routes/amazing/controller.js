import { Product } from '../../models/product.js';

// دریافت محصولات شگفت‌انگیز
export const getAmazingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAmazing: true });
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// دریافت محصول شگفت‌انگیز با شناسه
export const getAmazingProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isAmazing) {
      return res.status(404).json({ success: false, message: 'محصول شگفت‌انگیز یافت نشد' });
    }
    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ایجاد محصول شگفت‌انگیز (ادمین)
export const createAmazingProduct = async (req, res) => {
  try {
    const data = { ...req.body, isAmazing: true };
    if (req.file) data.image = `/uploads/products/${req.file.filename}`;
    const product = await Product.create(data);
    return res.status(201).json({ success: true, message: 'محصول شگفت‌انگیز ثبت شد', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ویرایش محصول شگفت‌انگیز (ادمین)
export const updateAmazingProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/products/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, data);
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }
    return res.json({ success: true, message: 'محصول ویرایش شد', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// حذف محصول شگفت‌انگیز (ادمین)
export const deleteAmazingProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }
    return res.json({ success: true, message: 'محصول حذف شد' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
