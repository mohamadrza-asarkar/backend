import rateLimit from 'express-rate-limit';

/**
 * General API Rate Limiter
 * 200 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    statusCode: 429,
    message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند دقیقه دیگر مجدداً تلاش نمایید.',
    error: 'Too Many Requests'
  }
});

/**
 * Strict Auth Rate Limiter (Login / Register / Sensitive endpoints)
 * 25 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'تعداد تلاش‌های ناموفق یا درخواست‌های احراز هویت بیش از حد مجاز است. لطفاً ۱۵ دقیقه دیگر امتحان کنید.',
    error: 'Too Many Requests - Auth'
  }
});
