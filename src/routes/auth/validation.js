/**
 * Auth Request Validators
 * اعتبارسنجی ورود و ثبت‌نام با شماره تلفن (موبایل ۱۱ رقمی) و کلمه عبور
 */

export const validateRegister = (data = {}) => {
  const errors = {};
  const { name, phone, password } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'نام و نام خانوادگی الزامی است (حداقل ۲ کاراکتر)';
  }

  if (!phone || typeof phone !== 'string' || !/^09\d{9}$/.test(phone.trim())) {
    errors.phone = 'شماره موبایل الزامی است و باید ۱۱ رقمی با فرمت معتبر باشد (مثال: 09121234567)';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateLogin = (data = {}) => {
  const errors = {};
  const { phone, password } = data;

  if (!phone || typeof phone !== 'string' || !/^09\d{9}$/.test(phone.trim())) {
    errors.phone = 'شماره موبایل معتبر الزامی است (مثال: 09121234567)';
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.password = 'رمز عبور الزامی است';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateUpdateProfile = (data = {}) => {
  const errors = {};
  const { name, phone } = data;

  if (name && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.name = 'نام باید حداقل ۲ کاراکتر باشد';
  }

  if (phone && !/^09\d{9}$/.test(phone.trim())) {
    errors.phone = 'فرمت شماره همراه نامعتبر است (مثال: 09121234567)';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateChangePassword = (data = {}) => {
  const errors = {};
  const { currentPassword, newPassword } = data;

  if (!currentPassword) {
    errors.currentPassword = 'رمز عبور فعلی الزامی است';
  }

  if (!newPassword || newPassword.length < 6) {
    errors.newPassword = 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
