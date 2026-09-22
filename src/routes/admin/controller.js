import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../../models/user.js';
import { Product } from '../../models/product.js';
import { Order } from '../../models/order.js';
import { Review } from '../../models/review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// حذف کاربر (ادمین)
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    return res.json({ success: true, message: 'کاربر با موفقیت حذف شد' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// حذف سفارش (ادمین)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }

    if (order.paymentReceipt && typeof order.paymentReceipt === 'string') {
      const receiptPath = order.paymentReceipt;
      if (receiptPath.includes('/uploads/') || receiptPath.includes('uploads/')) {
        const cleanPath = receiptPath.substring(receiptPath.indexOf('uploads/'));
        const absolutePath = path.join(__dirname, '../../../public', cleanPath);
        if (fs.existsSync(absolutePath)) {
          try {
            fs.unlinkSync(absolutePath);
          } catch (err) {
            console.error('Failed to delete receipt file:', err.message);
          }
        }
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'سفارش با موفقیت حذف شد' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
