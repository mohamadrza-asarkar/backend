import { Product } from '../../models/product.js';

// دریافت لیست محصولات
export const getProducts = async (req, res) => {
  try {
    const { search, q, isAvailable, isAmazing } = req.query;
    const filter = {};
    if (search || q) filter.search = search || q;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;
    if (isAmazing !== undefined) filter.isAmazing = isAmazing;

    const products = await Product.find(filter);
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// دریافت محصولات شگفت‌انگیز
export const getAmazingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAmazing: true });
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// جستجوی محصول
export const searchProducts = async (req, res) => {
  try {
    const products = await Product.find({ search: req.query.q || '' });
    return res.json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// دریافت محصول با شناسه
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }
    return res.json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// افزودن محصول جدید (ادمین)
export const createProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/products/${req.file.filename}`;
    const product = await Product.create(data);
    return res.status(201).json({ success: true, message: 'محصول با موفقیت ثبت شد', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ویرایش محصول (ادمین)
export const updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = `/uploads/products/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, data);
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }
    return res.json({ success: true, message: 'محصول با موفقیت ویرایش شد', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// حذف محصول (ادمین)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'محصول یافت نشد' });
    }
    return res.json({ success: true, message: 'محصول با موفقیت حذف شد' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
