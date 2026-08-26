/**
 * Order Request Validators
 * اسکیما سفارش: محصولات (products یا items)، نام و نام خانوادگی خریدار (buyerName)، آدرس (address) و شماره تلفن (phone)
 */

export const validateCreateOrder = (data = {}) => {
  const errors = {};
  const buyerName = data.buyerName || (data.shippingAddress && data.shippingAddress.fullName);
  const address = data.address || (data.shippingAddress && (typeof data.shippingAddress === 'string' ? data.shippingAddress : data.shippingAddress.addressLine));
  const phone = data.phone || (data.shippingAddress && data.shippingAddress.phone);
  const products = data.products || data.items;

  if (!buyerName || typeof buyerName !== 'string' || buyerName.trim().length < 2) {
    errors.buyerName = 'نام و نام خانوادگی خریدار الزامی است';
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    errors.address = 'آدرس کامل و معتبر برای ارسال الزامی است';
  }

  if (!phone || !/^09\d{9}$/.test(phone)) {
    errors.phone = 'شماره تلفن همراه معتبر خریدار الزامی است (مانند: 09123456789)';
  }

  if (products !== undefined && (!Array.isArray(products) || products.length === 0)) {
    errors.products = 'لیست محصولات سفارش نمی‌تواند آرایه خالی باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateUpdateOrderStatus = (data = {}) => {
  const errors = {};
  const status = data.status || data.orderStatus;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (status && !validStatuses.includes(status)) {
    errors.status = `وضعیت سفارش نامعتبر است. مقادیر مجاز: ${validStatuses.join(', ')}`;
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
