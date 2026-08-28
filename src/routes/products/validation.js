/**
 * Product Request Validators
 * ساختار محصول: اسم (name)، توضیحات (description)، قیمت (price)، موجودی (isAvailable) و نظرات (reviews)
 */

export const validateProduct = (data = {}) => {
  const errors = {};
  const productName = data.name || data.title;
  const price = data.price !== undefined ? Number(data.price) : (
    data.originalPrice && data.discountPercent 
      ? Number(data.originalPrice) - Math.round((Number(data.originalPrice) * Number(data.discountPercent)) / 100)
      : undefined
  );
  const { description, originalPrice, discountPercent } = data;

  if (!productName || typeof productName !== 'string' || productName.trim().length < 2) {
    errors.name = 'اسم محصول الزامی است (حداقل ۲ کاراکتر)';
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    errors.price = 'قیمت محصول یا قیمت اصلی با تخفیف باید یک عدد مثبت معتبر باشد';
  }

  if (originalPrice !== undefined && (isNaN(Number(originalPrice)) || Number(originalPrice) < 0)) {
    errors.originalPrice = 'قیمت اصلی باید یک عدد نامنفی معتبر باشد';
  }

  if (discountPercent !== undefined && (isNaN(Number(discountPercent)) || Number(discountPercent) < 0 || Number(discountPercent) > 100)) {
    errors.discountPercent = 'درصد تخفیف باید عددی بین ۰ تا ۱۰۰ باشد';
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
  const { price, originalPrice, discountPercent } = data;

  if (productName !== undefined && (typeof productName !== 'string' || productName.trim().length < 2)) {
    errors.name = 'اسم محصول باید حداقل ۲ کاراکتر باشد';
  }

  if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
    errors.price = 'قیمت محصول باید یک عدد مثبت معتبر باشد';
  }

  if (originalPrice !== undefined && (isNaN(Number(originalPrice)) || Number(originalPrice) < 0)) {
    errors.originalPrice = 'قیمت اصلی باید یک عدد نامنفی معتبر باشد';
  }

  if (discountPercent !== undefined && (isNaN(Number(discountPercent)) || Number(discountPercent) < 0 || Number(discountPercent) > 100)) {
    errors.discountPercent = 'درصد تخفیف باید عددی بین ۰ تا ۱۰۰ باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
