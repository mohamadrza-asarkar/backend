/**
 * Category Request Validators
 */

export const validateCategory = (data = {}) => {
  const errors = {};
  const { name } = data;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'نام دسته‌بندی الزامی است (حداقل ۲ کاراکتر)';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
