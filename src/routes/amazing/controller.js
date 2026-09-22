import { Product } from '../../models/product.js';

// دریافت محصولات شگفت‌انگیز
export const getAmazingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAmazing: true });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// دریافت محصول شگفت‌انگیز با شناسه
export const getAmazingProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isAmazing) {
      return res.status(404).json({ message: 'محصول شگفت‌انگیز یافت نشد' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ایجاد محصول شگفت‌انگیز (ادمین)
export const createAmazingProduct = async (req, res) => {
  try {
    // ابتدا شگفت‌انگیز بودن سایر محصولات را لغو می‌کنیم
    await Product.updateMany({}, { isAmazing: false });

    const data = { ...req.body, isAmazing: true };
    if (req.file) data.image = `/uploads/products/${req.file.filename}`;
    
    // کست کردن مقادیر منطقی به بولین واقعی
    if (data.isAvailable !== undefined) {
      data.isAvailable = data.isAvailable === 'true' || data.isAvailable === true;
    }

    const product = await Product.create(data);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ویرایش محصول شگفت‌انگیز (ادمین)
export const updateAmazingProduct = async (req, res) => {
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

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// حذف محصول شگفت‌انگیز (ادمین)
export const deleteAmazingProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }
    return res.json({ success: true, message: 'محصول حذف شد' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// فعال/غیرفعال کردن شگفت‌انگیز بودن یک محصول (ادمین)
export const toggleAmazingProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    const nextState = !product.isAmazing;

    if (nextState === true) {
      // اگر کاربر قصد فعال کردن شگفت‌انگیز برای این محصول را دارد، ابتدا همه موارد قبلی را لغو می‌کنیم
      await Product.updateMany({}, { isAmazing: false });
    }

    product.isAmazing = nextState;
    await product.save();

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
