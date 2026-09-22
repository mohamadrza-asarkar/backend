export const imageUrlAbsoluteMiddleware = (req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    // تابع بازگشتی برای تبدیل آدرس‌های نسبی آپلود به آدرس‌های کامل و مطلق
    const makeUrlsAbsolute = (obj) => {
      if (typeof obj === 'string') {
        // اگر آدرس مربوط به آپلودها در هاست باشد
        if (obj.startsWith('/uploads/')) {
          return `${baseUrl}${obj}`;
        }
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(item => makeUrlsAbsolute(item));
      }
      if (obj !== null && typeof obj === 'object') {
        // عدم پپایش شی‌های سیستمی خاص مثل شناسه دیتابیس یا تاریخ
        if (obj.constructor && ['ObjectId', 'Date', 'Buffer', 'RegExp'].includes(obj.constructor.name)) {
          return obj;
        }

        // تبدیل اسناد مونگوس به آبجکت خام جهت ادیت راحت‌تر
        const plainObj = typeof obj.toObject === 'function' ? obj.toObject({ virtuals: true }) : obj;
        const newObj = {};
        for (const key in plainObj) {
          if (Object.prototype.hasOwnProperty.call(plainObj, key)) {
            newObj[key] = makeUrlsAbsolute(plainObj[key]);
          }
        }
        return newObj;
      }
      return obj;
    };

    if (body) {
      try {
        const transformedBody = makeUrlsAbsolute(body);
        return originalJson.call(this, transformedBody);
      } catch (err) {
        console.error('Error converting image URLs to absolute:', err);
      }
    }
    return originalJson.call(this, body);
  };
  next();
};
