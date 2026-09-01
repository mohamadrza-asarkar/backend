import mongoose from 'mongoose';
import './db.js';

export const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  sender: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }
}, {
  timestamps: true
});

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
export const ReviewModel = Review;
export default Review;


