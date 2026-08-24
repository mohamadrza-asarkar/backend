/**
 * Product Request Validators
 * ساختار محصول: اسم (name)، توضیحات (description)، قیمت (price)، موجودی (isAvailable) و نظرات (reviews)
 */

export const validateProduct = (data = {}) => {
  const errors = {};
  const productName = data.name || data.title;
  const { price, description } = data;

  if (!productName || typeof productName !== 'string' || productName.trim().length < 2) {
    errors.name = 'اسم محصول الزامی است (حداقل ۲ کاراکتر)';
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    errors.price = 'قیمت محصول باید یک عدد مثبت معتبر باشد';
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.description = 'توضیحات محصول باید رشته متنی باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateProductUpdate = (data = {}) => {
  const errors = {};
  const productName = data.name || data.title;
  const { price } = data;

  if (productName !== undefined && (typeof productName !== 'string' || productName.trim().length < 2)) {
    errors.name = 'اسم محصول باید حداقل ۲ کاراکتر باشد';
  }

  if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
    errors.price = 'قیمت محصول باید یک عدد مثبت معتبر باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
