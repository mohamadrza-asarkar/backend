/**
 * Admin Request Validators
 */

export const validateUpdateUserRole = (data = {}) => {
  const errors = {};
  const { role } = data;

  if (!role || !['admin', 'user', 'manager', 'editor'].includes(role)) {
    errors.role = 'نقش کاربری نامعتبر است. مقادیر مجاز: admin, user, manager, editor';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
