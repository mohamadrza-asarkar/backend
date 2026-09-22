import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

const jwtKey = process.env.JWT_SECRET || 'ecommerce_secret_jwt_key_2025_safe_and_secure';

/**
 * میدلور بررسی دسترسی ادمین (کاملاً بهینه و هوشمند)
 */
export async function isAdmin(req, res, next) {
  try {
    // ۱. بررسی توکن فقط و فقط در هدرها (عدم پذیرش توکن یا ادمین از بدنه درخواست)
    let token = req.headers.token || req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'عدم دسترسی: توکن ارسال نشده است'
      });
    }

    // حذف پیشوند احتمالی Bearer و کاراکترهای کوتیشن احتمالی اطراف توکن
    if (typeof token === 'string') {
      token = token.trim();
      if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }
      token = token.replace(/^["']|["']$/g, ''); // حذف کوتیشن‌های احتمالی ارسالی از کلاینت
    }

    const decoded = jwt.verify(token, jwtKey);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'عدم دسترسی: توکن نامعتبر است'
      });
    }

    // شناسایی ادمین بر اساس ادعای امضاشده داخل توکن رمزنگاری‌شده (نه بدنه درخواست)
    const isTokenAdmin = decoded.role === 'admin' || decoded.admin === true;

    if (!isTokenAdmin) {
      return res.status(403).json({
        success: false,
        message: 'عدم دسترسی: شما ادمین نیستید'
      });
    }

    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId);

    if (user) {
      req.user = user;
    } else {
      req.user = { _id: userId, role: 'admin', admin: true, ...decoded };
    }
    
    return next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'توکن نامعتبر یا منقضی شده است'
    });
  }
}

export default isAdmin;
