import { Review } from '../../models/review.js';
import { Product } from '../../models/product.js';

// دریافت نظرات
export const getProductReviews = async (req, res) => {
  try {
    const filter = req.query.productId ? { productId: req.query.productId } : {};
    const reviews = await Review.find(filter);
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ثبت نظر جدید
export const createReview = async (req, res) => {
  try {
    const { productId, rating = 5, comment, text, sender } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }

    const review = await Review.create({
      productId,
      sender: sender || req.user?.name || 'کاربر',
      comment: comment || text || '',
      rating: Number(rating) || 5
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// حذف نظر (ادمین)
export const deleteReview = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'نظر یافت نشد' });
    }
    return res.json({ success: true, message: 'نظر حذف شد' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// پاسخ به نظر (ادمین)
export const replyReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { adminReply: req.body.reply }, { new: true });
    if (!review) {
      return res.status(404).json({ message: 'نظر یافت نشد' });
    }
    return res.json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
