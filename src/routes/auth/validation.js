/**
 * Auth Request Validators
 */

export const validateRegister = (data = {}) => {
  const errors = {};
  const { name, email, password, phone } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'نام و نام خانوادگی الزامی است (حداقل ۲ کاراکتر)';
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'فرمت ایمیل نامعتبر است';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
  }

  if (phone && !/^09\d{9}$/.test(phone)) {
    errors.phone = 'شماره موبایل باید ۱۱ رقمی و با 09 شروع شود';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateLogin = (data = {}) => {
  const errors = {};
  const { email, password } = data;

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'ایمیل معتبر الزامی است';
  }

  if (!password || typeof password !== 'string') {
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

  if (phone && !/^09\d{9}$/.test(phone)) {
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
