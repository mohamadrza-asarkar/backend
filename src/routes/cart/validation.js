/**
 * Cart Request Validators
 */

export const validateCartItem = (data = {}) => {
  const errors = {};
  const { productId, quantity } = data;

  if (!productId || typeof productId !== 'string') {
    errors.productId = 'شناسه محصول (productId) الزامی است';
  }

  if (quantity !== undefined && (isNaN(Number(quantity)) || Number(quantity) <= 0)) {
    errors.quantity = 'تعداد محصول باید حداقل ۱ باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateUpdateCartItem = (data = {}) => {
  const errors = {};
  const { quantity } = data;

  if (quantity === undefined || isNaN(Number(quantity)) || Number(quantity) < 0) {
    errors.quantity = 'تعداد محصول باید یک عدد صحیح معتبر باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
