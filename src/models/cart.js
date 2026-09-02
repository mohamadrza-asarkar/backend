import mongoose from 'mongoose';

export const cartSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  products: [{
    productId: { type: String, required: true },
    name: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    totalPrice: { type: Number, default: 0 },
    image: { type: String }
  }],
  totalPrice: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export const CartModel = Cart;
export default Cart;


