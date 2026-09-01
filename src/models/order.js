import mongoose from 'mongoose';
import './db.js';

export const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, default: '' },
  postTrackingCode: { 
    type: String, 
    default: '',
    index: true,
    sparse: true
  },
  state: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'payment_submitted', 'processing', 'shipped', 'delivered', 'cancelled'] 
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'submitted', 'approved', 'rejected']
  },
  paymentReceipt: {
    type: String,
    default: ''
  },
  paymentReceiptDate: {
    type: Date
  },
  adminNote: {
    type: String,
    default: ''
  },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalPrice: { type: Number, default: 0 },
  time: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const OrderModel = Order;
export default Order;
