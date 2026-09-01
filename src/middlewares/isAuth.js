import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

const jwtKey = process.env.JWT_SECRET || 'ecommerce_secret_jwt_key_2025_safe_and_secure';

/**
 * میدلور احراز هویت کاربر
 */
export async function isAuth(req, res, next) {
  try {
    let token = req.headers.token || req.headers.authorization;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'عدم دسترسی: توکن ارسال نشده است'
      });
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }

    const decoded = jwt.verify(token, jwtKey);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: 'عدم دسترسی: توکن نامعتبر است'
      });
    }

    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'توکن نامعتبر یا منقضی شده است'
    });
  }
}

export default isAuth;
