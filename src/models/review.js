import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';
import { Product } from './product.js';

/**
 * Review Mongoose Schema
 * مدل نظر و دیدگاه
 * شامل: شناسه محصول (productId)، فرستنده (sender)، متن نظر (comment) و امتیاز (rating)
 */
export const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  sender: { type: String, required: true, trim: true },
  comment: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

/**
 * ReviewModel Adapter
 */
export const ReviewModel = {
  find: async (query = {}) => {
    if (isDBConnected()) {
      const mongoQuery = {};
      if (query.productId) mongoQuery.productId = query.productId;
      if (query.sender) {
        mongoQuery.$or = [{ sender: query.sender }, { userName: query.sender }];
      }
      return await Review.find(mongoQuery).sort({ createdAt: -1 }).lean();
    }

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
    if (isDBConnected()) {
      return await Review.findById(id).lean();
    }
    return db.reviews.find(r => r._id === id) || null;
  },

  create: async (data) => {
    const sender = data.sender || data.userName || 'کاربر مهمان';
    const commentText = data.comment || data.text || '';
    const ratingNum = Number(data.rating) || 5;

    if (isDBConnected()) {
      const created = await Review.create({
        productId: data.productId,
        sender,
        comment: commentText,
        rating: ratingNum
      });

      // Also append to product's reviews subdocuments in MongoDB
      try {
        if (data.productId) {
          await Product.findByIdAndUpdate(data.productId, {
            $push: {
              reviews: {
                productId: data.productId,
                sender,
                comment: commentText,
                rating: ratingNum,
                createdAt: new Date()
              }
            }
          });
        }
      } catch (err) {
        console.warn('Could not push review to product subdocument:', err.message);
      }

      return created.toObject();
    }

    const newReview = {
      _id: data._id || db.generateId(),
      productId: data.productId,
      sender: sender,
      userName: sender,
      comment: commentText,
      text: commentText,
      rating: ratingNum,
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newReview);

    // Update product reviews list in memory
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
    if (isDBConnected()) {
      return await Review.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
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
    if (isDBConnected()) {
      return await Review.findByIdAndDelete(id).lean();
    }
    const index = db.reviews.findIndex(r => r._id === id);
    if (index === -1) return null;
    const deleted = db.reviews.splice(index, 1);
    return deleted[0];
  }
};
