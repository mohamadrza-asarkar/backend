import { ReviewModel } from '../../models/review.js';
import { ProductModel } from '../../models/product.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Get reviews
 * GET /api/reviews?productId=...
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId, sender } = req.query;
    const filter = {};
    if (productId) filter.productId = productId;
    if (sender) filter.sender = sender;

    const reviews = await ReviewModel.find(filter);
    return successResponse(res, 200, 'لیست نظرات دریافت شد', reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a review for a product
 * POST /api/reviews
 * بدنه درخواست: productId (شناسه محصول), sender (فرستنده), comment یا text (متن نظر), rating (امتیاز)
 */
export const createReview = async (req, res, next) => {
  try {
    const user = req.user;
    const { productId, rating, comment, text, sender } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product) {
      return errorResponse(res, 404, 'محصول مورد نظر برای ثبت دیدگاه یافت نشد');
    }

    const reviewSender = sender || user?.name || 'کاربر مهمان';
    const reviewText = comment || text;

    const newReview = await ReviewModel.create({
      productId: product._id,
      sender: reviewSender,
      comment: reviewText,
      text: reviewText,
      rating: Number(rating) || 5
    });

    return successResponse(res, 201, 'نظر با موفقیت ثبت گردید', newReview);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete review (Admin Only)
 * DELETE /api/reviews/:id
 */
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await ReviewModel.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, 404, 'دیدگاه یافت نشد');
    }

    return successResponse(res, 200, 'دیدگاه حذف گردید', { id });
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to review (Admin Only)
 * POST /api/reviews/:id/reply
 */
export const replyReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const updated = await ReviewModel.findByIdAndUpdate(id, { adminReply: reply });
    if (!updated) {
      return errorResponse(res, 404, 'دیدگاه یافت نشد');
    }

    return successResponse(res, 200, 'پاسخ به دیدگاه با موفقیت ثبت شد', updated);
  } catch (error) {
    next(error);
  }
};

