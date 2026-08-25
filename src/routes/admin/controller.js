import { UserModel } from '../../models/user.js';
import { ProductModel } from '../../models/product.js';
import { OrderModel } from '../../models/order.js';
import { ReviewModel } from '../../models/review.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Get comprehensive admin dashboard analytics & metrics
 * GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalProducts = await ProductModel.countDocuments();
    const totalOrders = await OrderModel.countDocuments();
    const orders = await OrderModel.find();
    const reviews = await ReviewModel.find();

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid' || o.status === 'delivered')
      .reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

    const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;

    // Dynamically calculate sales per status or recent months from real orders
    const statusBreakdown = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    return successResponse(res, 200, 'آمار و ارقام داشبورد مدیریت دریافت شد', {
      summary: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        pendingOrdersCount,
        deliveredOrdersCount,
        totalReviews: reviews.length
      },
      statusBreakdown,
      recentOrders: orders.slice(0, 10)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users list (Admin Only)
 * GET /api/admin/users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find();
    const sanitized = users.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    return successResponse(res, 200, 'لیست کاربران دریافت شد', sanitized);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (Admin Only)
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updated = await UserModel.findByIdAndUpdate(id, { role });
    if (!updated) {
      return errorResponse(res, 404, 'کاربر مورد نظر یافت نشد');
    }

    const { password, ...userWithoutPassword } = updated;
    return successResponse(res, 200, 'نقش کاربر با موفقیت تغییر یافت', userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user active status (Admin Only)
 * PUT /api/admin/users/:id/toggle-status
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return errorResponse(res, 404, 'کاربر مورد نظر یافت نشد');
    }

    const updated = await UserModel.findByIdAndUpdate(id, { isActive: !user.isActive });
    const { password, ...userWithoutPassword } = updated;

    return successResponse(res, 200, `وضعیت کاربر با موفقیت به ${updated.isActive ? 'فعال' : 'غیرفعال'} تغییر یافت`, userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders across the system (Admin Only)
 * GET /api/admin/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find();
    return successResponse(res, 200, 'لیست کل سفارشات سیستم دریافت شد', orders);
  } catch (error) {
    next(error);
  }
};
