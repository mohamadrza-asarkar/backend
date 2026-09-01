import { errorResponse } from '../utils/response.js';

/**
 * Higher-order middleware function to run validation rules
 * @param {Function} validatorFn - Function taking (data) and returning { error, value }
 * @param {'body' | 'query' | 'params'} [source='body']
 */
export const validateRequest = (validatorFn, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = validatorFn(data);

    if (error) {
      return errorResponse(res, 422, 'خطای اعتبارسنجی داده‌های ورودی', error);
    }

    req[source] = value !== undefined ? value : data;
    next();
  };
};
