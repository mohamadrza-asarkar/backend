import { errorResponse } from '../utils/response.js';

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `مسیر درخواستی یافت نشد: [${req.method}] ${req.originalUrl}`);
};

/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`🚨 Error in [${req.method}] ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || 'خطای غیرمنتظره در سرور رخ داده است';

  return errorResponse(res, statusCode, message, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    name: err.name
  });
};
