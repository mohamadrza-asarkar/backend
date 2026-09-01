import { User } from '../../models/user.js';
import { Product } from '../../models/product.js';
import { Order } from '../../models/order.js';
import { Review } from '../../models/review.js';

// آمار کلی سیستم (ادمین)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalReviews = await Review.countDocuments();
    const orders = await Order.find();

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    return res.json({
      success: true,
      data: {
        summary: { totalRevenue, totalOrders, totalProducts, totalUsers, totalReviews },
        recentOrders: orders.slice(0, 10)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// لیست تمام کاربران (ادمین)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const sanitized = users.map(({ password, ...u }) => u);
    return res.json({ success: true, data: sanitized });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// تغییر نقش کاربر (ادمین)
export const updateUserRole = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    }
    const { password, ...userData } = updated;
    return res.json({ success: true, message: 'نقش کاربر به‌روزرسانی شد', data: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// فعال/غیرفعال‌سازی وضعیت کاربر (ادمین)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: !user.isActive });
    const { password, ...userData } = updated;
    return res.json({ success: true, message: 'وضعیت کاربر تغییر یافت', data: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// دریافت تمام سفارشات (ادمین)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
