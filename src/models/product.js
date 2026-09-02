import mongoose from 'mongoose';

export const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  isAmazing: { type: Boolean, default: false },
  amazingExpiresAt: { type: Date, default: null },
  isAvailable: { type: Boolean, default: true },
  countInStock: { type: Number, default: 0, min: 0 },
  image: { type: String, default: '' },
  reviews: [{
    sender: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const ProductModel = Product;
export default Product;


