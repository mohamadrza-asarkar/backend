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

    // تنظیم خودکار تاریخ انقضای شگفت‌انگیز (مانند ۲ روز یا چند ساعت آینده)
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

// ویرایش محصول شگفت‌انگیز (ادمین)
export const updateAmazingProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

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
    data.originalPrice = inputPrice; // قیمت اصلی همان قیمت ورودی اولیه است

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
