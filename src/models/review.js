import { db } from './db.js';

/**
 * Review Model - نظر / دیدگاه
 * هر نظر شامل: فرستنده (sender)، متن نظر (comment / text)، امتیاز (rating) و شناسه محصول (productId) می‌باشد.
 */
export const ReviewModel = {
  find: async (query = {}) => {
    let list = [...db.reviews];
    if (query.productId) {
      list = list.filter(r => r.productId === query.productId);
    }
    if (query.sender) {
      list = list.filter(r => r.sender === query.sender || r.userName === query.sender);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  },

  findById: async (id) => {
    return db.reviews.find(r => r._id === id) || null;
  },

  create: async (data) => {
    const sender = data.sender || data.userName || 'کاربر مهمان';
    const commentText = data.comment || data.text || '';
    const ratingNum = Number(data.rating) || 5;

    const newReview = {
      _id: data._id || db.generateId(),
      productId: data.productId,
      sender: sender,
      userName: sender, // alias
      comment: commentText,
      text: commentText, // alias
      rating: ratingNum,
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newReview);

    // Update product reviews list and recalculate average rating
    const product = db.products.find(p => p._id === data.productId);
    if (product) {
      const allProductReviews = db.reviews.filter(r => r.productId === data.productId);
      const avg = allProductReviews.reduce((acc, cur) => acc + (cur.rating || 5), 0) / (allProductReviews.length || 1);
      product.rating = Number(avg.toFixed(1));
      product.numReviews = allProductReviews.length;
    }

    return newReview;
  },

  findByIdAndUpdate: async (id, updateData) => {
    const index = db.reviews.findIndex(r => r._id === id);
    if (index === -1) return null;

    const current = db.reviews[index];
    const sender = updateData.sender || updateData.userName || current.sender;
    const comment = updateData.comment || updateData.text || current.comment;

    db.reviews[index] = {
      ...current,
      ...updateData,
      sender: sender,
      userName: sender,
      comment: comment,
      text: comment,
      rating: updateData.rating !== undefined ? Number(updateData.rating) : current.rating,
      updatedAt: new Date().toISOString()
    };
    return db.reviews[index];
  },

  findByIdAndDelete: async (id) => {
    const index = db.reviews.findIndex(r => r._id === id);
    if (index === -1) return null;
    const deleted = db.reviews.splice(index, 1);
    return deleted[0];
  }
};
