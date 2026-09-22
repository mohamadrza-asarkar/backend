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
      summary: { totalRevenue, totalOrders, totalProducts, totalUsers, totalReviews },
      recentOrders: orders.slice(0, 10)
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// لیست تمام کاربران (ادمین)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const sanitized = users.map(user => {
      const u = user.toObject ? user.toObject() : { ...user };
      delete u.password;
      return u;
    });
    return res.json(sanitized);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// تغییر نقش کاربر (ادمین)
export const updateUserRole = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    const userData = updated.toObject();
    delete userData.password;
    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// فعال/غیرفعال‌سازی وضعیت کاربر (ادمین)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: !user.isActive }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    const userData = updated.toObject();
    delete userData.password;
    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// دریافت تمام سفارشات (ادمین)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
