/**
 * Slide Request Validators
 * اسلاید: فقط شامل تصویر است که با مالتر یا لینک ارسال می‌شود
 */

export const validateSlide = (data = {}) => {
  const errors = {};
  const { image } = data;

  if (!image || typeof image !== 'string' || image.trim().length === 0) {
    errors.image = 'تصویر اسلاید الزامی است';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
