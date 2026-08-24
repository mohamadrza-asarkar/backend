/**
 * Standard API Success Response Formatter
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} data
 * @param {Object} [meta]
 */
export const successResponse = (res, statusCode = 200, message = 'عملیات با موفقیت انجام شد', data = null, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard API Error Response Formatter
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} [errors]
 */
export const errorResponse = (res, statusCode = 500, message = 'خطای داخلی سرور رخ داده است', errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard Paginated Response Helper
 */
export const paginateResponse = (res, items, page, limit, totalItems, message = 'دریافت لیست با موفقیت') => {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data: items,
    pagination: {
      currentPage: Number(page),
      limit: Number(limit),
      totalItems: Number(totalItems),
      totalPages,
      hasNextPage: Number(page) < totalPages,
      hasPrevPage: Number(page) > 1
    },
    timestamp: new Date().toISOString()
  });
};
