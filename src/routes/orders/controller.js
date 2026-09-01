import { Order } from '../../models/order.js';
import { Cart } from '../../models/cart.js';

// ثبت سفارش جدید همراه با امکان پیوست رسید پرداخت
export const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { name, phone, address, postalCode, products = [], paymentReceipt: receiptBody } = req.body;

    let items = typeof products === 'string' ? JSON.parse(products) : products;
    if ((!items || !items.length) && user) {
      const cart = await Cart.findOne({ userId: user._id });
      if (cart?.products?.length) items = cart.products;
    }

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'محصولی برای ثبت سفارش ارسال نشده است' });
    }

    const totalPrice = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

    // دریافت تصویر رسید پرداخت (از فایل آپلود شده یا از بدنه درخواست)
    let receiptUrl = '';
    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
    } else if (receiptBody) {
      receiptUrl = receiptBody;
    }

    const initialStatus = receiptUrl ? 'payment_submitted' : 'pending';
    const paymentStatus = receiptUrl ? 'submitted' : 'pending';

    const order = await Order.create({
      name: name || user?.name || 'مشتری',
      phone: phone || user?.phone || '',
      address: address || '',
      postalCode: postalCode || '',
      postTrackingCode: req.body.postTrackingCode || '',
      state: initialStatus,
      paymentStatus,
      paymentReceipt: receiptUrl,
      paymentReceiptDate: receiptUrl ? new Date() : null,
      products: items,
      totalPrice,
      time: new Date()
    });

    if (user) {
      await Cart.findOneAndUpdate({ userId: user._id }, { products: [], totalPrice: 0 });
    }

    return res.status(201).json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ارسال یا آپلود رسید پرداخت برای سفارش ثبت‌شده
export const uploadPaymentReceipt = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { receiptImage, paymentReceipt } = req.body;

    let receiptUrl = '';
    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
    } else if (receiptImage || paymentReceipt) {
      receiptUrl = receiptImage || paymentReceipt;
    }

    if (!receiptUrl) {
      return res.status(400).json({ success: false, message: 'فایل یا تصویر رسید پرداخت الزامی است' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'سفارش یافت نشد' });
    }

    // بررسی دسترسی (اگر ادمین نیست، فقط سفارش‌های با شماره خودش را دستکاری کند)
    if (req.user?.role !== 'admin' && !req.user?.admin && order.phone !== req.user?.phone) {
      return res.status(403).json({ success: false, message: 'شما مجاز به تغییر این سفارش نیستید' });
    }

    order.paymentReceipt = receiptUrl;
    order.paymentReceiptDate = new Date();
    order.paymentStatus = 'submitted';
    order.state = 'payment_submitted';
    await order.save();

    return res.json({
      success: true,
      message: 'رسید پرداخت با موفقیت ارسال شد و در انتظار تایید مدیریت است',
      data: order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// بررسی، تایید یا رد رسید پرداخت توسط ادمین
export const verifyPayment = async (req, res) => {
  try {
    const { status, adminNote, state, postTrackingCode, postalTrackingCode } = req.body; // status: 'approved' | 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'وضعیت باید approved یا rejected باشد' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'سفارش یافت نشد' });
    }

    const updateFields = {};
    if (status === 'approved') {
      updateFields.paymentStatus = 'approved';
      updateFields.state = state || 'processing';
      updateFields.adminNote = adminNote || 'رسید پرداخت تایید شد و سفارش در حال آماده‌سازی است';
    } else {
      updateFields.paymentStatus = 'rejected';
      updateFields.state = state || 'pending';
      updateFields.adminNote = adminNote || 'رسید پرداخت نامعتبر تشخیص داده شد. لطفاً مجدداً رسید معتبر ارسال فرمایید';
    }

    if (postTrackingCode !== undefined) updateFields.postTrackingCode = postTrackingCode;
    if (postalTrackingCode !== undefined) updateFields.postTrackingCode = postalTrackingCode;

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    return res.json({
      success: true,
      message: status === 'approved' ? 'رسید پرداخت با موفقیت تایید شد' : 'رسید پرداخت رد شد',
      data: updatedOrder
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// پیگیری وضعیت سفارش با کد رهگیری پستی
export const getOrderByTrackingCode = async (req, res) => {
  try {
    const postCode = req.params.postTrackingCode || req.params.trackingCode || req.params.code;
    let order = await Order.findOne({ postTrackingCode: postCode });
    if (!order) {
      order = await Order.findById(postCode).catch(() => null);
    }
    if (!order) {
      return res.status(404).json({ success: false, message: 'سفارشی با این کد رهگیری پستی یافت نشد' });
    }
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// دریافت سفارش‌های کاربر / یا همه سفارش‌ها برای ادمین
export const getMyOrders = async (req, res) => {
  try {
    const filter = (req.user?.role === 'admin' || req.user?.admin) ? {} : { phone: req.user?.phone };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// دریافت سفارش با شناسه
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'سفارش یافت نشد' });
    }
    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// تغییر وضعیت سفارش و ثبت دستی کد رهگیری مرسوله پستی (توسط ادمین)
export const updateOrderStatus = async (req, res) => {
  try {
    const { state, status, adminNote, postTrackingCode, postalTrackingCode, paymentStatus } = req.body;
    const updateData = {};

    if (state || status) updateData.state = state || status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;
    if (postTrackingCode !== undefined) updateData.postTrackingCode = postTrackingCode;
    if (postalTrackingCode !== undefined) updateData.postTrackingCode = postalTrackingCode;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'سفارش یافت نشد' });
    }
    return res.json({ 
      success: true, 
      message: 'اطلاعات سفارش و کد رهگیری پستی با موفقیت توسط ادمین به‌روزرسانی شد', 
      data: order 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
