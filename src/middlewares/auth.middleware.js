import { verifyToken } from '../utils/jwt.js';
import { UserModel } from '../models/user.model.js';
import { errorResponse } from '../utils/response.js';

/**
 * Protect routes - verifies Bearer JWT token in Authorization header
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return errorResponse(res, 401, 'دسترسی غیرمجاز: لطفاً ابتدا وارد حساب کاربری خود شوید (توکن JWT یافت نشد)');
    }

    try {
      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return errorResponse(res, 401, 'کاربر متعلق به این توکن یافت نشد یا حذف شده است');
      }

      if (user.isActive === false) {
        return errorResponse(res, 403, 'حساب کاربری شما مسدود شده است');
      }

      req.user = user;
      next();
    } catch (err) {
      return errorResponse(res, 401, 'توکن نامعتبر یا منقضی شده است');
    }
  } catch (error) {
    return errorResponse(res, 500, 'خطا در اعتبارسنجی توکن دسترسی', error.message);
  }
};

/**
 * Admin only middleware - must be preceded by `protect`
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 403, 'دسترسی ممنوع: این عملیات نیازمند سطح دسترسی مدیر کل (Admin) می‌باشد');
  }
};

/**
 * Optional Auth middleware - sets req.user if valid token present, otherwise continues as guest
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await UserModel.findById(decoded.id);
        if (user && user.isActive !== false) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid, ignore for optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
};
