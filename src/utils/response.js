export const successResponse = (res, statusCode = 200, message = 'عملیات با موفقیت انجام شد', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null ? { data } : {})
  });
};

export const errorResponse = (res, statusCode = 500, message = 'خطا در انجام عملیات') => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

export const paginateResponse = (res, data, page, limit, total, message = 'دریافت با موفقیت') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    total,
    page: Number(page),
    limit: Number(limit)
  });
};
