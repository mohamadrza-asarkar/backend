/**
 * Review Request Validators
 * اسکیما نظر: فرستنده (sender)، متن نظر (comment / text) و امتیاز (rating)
 */

export const validateCreateReview = (data = {}) => {
  const errors = {};
  const { productId, rating } = data;
  const commentText = data.comment || data.text;
  const sender = data.sender || data.userName;

  if (!productId || typeof productId !== 'string') {
    errors.productId = 'شناسه محصول الزامی است';
  }

  if (sender !== undefined && (typeof sender !== 'string' || sender.trim().length < 2)) {
    errors.sender = 'نام فرستنده باید حداقل ۲ کاراکتر باشد';
  }

  if (rating === undefined || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    errors.rating = 'امتیاز باید عددی بین ۱ تا ۵ باشد';
  }

  if (!commentText || typeof commentText !== 'string' || commentText.trim().length < 2) {
    errors.comment = 'متن نظر الزامی است (حداقل ۲ کاراکتر)';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};

export const validateReplyReview = (data = {}) => {
  const errors = {};
  const { reply } = data;

  if (!reply || typeof reply !== 'string' || reply.trim().length < 2) {
    errors.reply = 'متن پاسخ مدیر الزامی است';
  }

  return {
    error: Object.keys(errors).length > 0 ? errors : null,
    value: data
  };
};
