import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';

/**
 * Order Product Sub-Schema
 */
export const orderProductSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String }
}, { _id: false });

/**
 * Order Mongoose Schema
 * مدل سفارش
 * شامل: محصولات (products)، نام و نام خانوادگی خریدار (buyerName)،
 * آدرس (address) و شماره تلفن خریدار (phone)
 */
export const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, default: () => `ORD-${Math.floor(10000 + Math.random() * 90000)}` },
  userId: { type: String, default: 'guest-user' },
  buyerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  products: [orderProductSchema],
  totalPrice: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'online' },
  paymentStatus: { type: String, default: 'pending' },
  trackingCode: { type: String, default: () => `TRK-${Math.floor(10000000 + Math.random() * 90000000)}` }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

/**
 * OrderModel Adapter
 */
export const OrderModel = {
  find: async (query = {}) => {
    if (isDBConnected()) {
      const mongoQuery = {};
      if (query.userId) mongoQuery.userId = query.userId;
      if (query.status || query.orderStatus) mongoQuery.status = query.status || query.orderStatus;
      if (query.phone) mongoQuery.phone = query.phone;
      return await Order.find(mongoQuery).sort({ createdAt: -1 }).lean();
    }

    let list = [...db.orders];
    if (query.userId) {
      list = list.filter(o => o.userId === query.userId);
    }
    if (query.status || query.orderStatus) {
      const st = query.status || query.orderStatus;
      list = list.filter(o => (o.status === st || o.orderStatus === st));
    }
    if (query.phone) {
      list = list.filter(o => o.phone === query.phone);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  },

  findById: async (id) => {
    if (isDBConnected()) {
      if (mongoose.isValidObjectId(id)) {
        const byId = await Order.findById(id).lean();
        if (byId) return byId;
      }
      return await Order.findOne({ $or: [{ _id: id }, { orderNumber: id }] }).lean();
    }
    return db.orders.find(o => o._id === id || o.orderNumber === id) || null;
  },

  create: async (data) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const products = data.products || data.items || [];
    const buyerName = data.buyerName || (data.shippingAddress && data.shippingAddress.fullName) || data.userName || 'خریدار';
    const address = data.address || (data.shippingAddress ? (typeof data.shippingAddress === 'string' ? data.shippingAddress : (data.shippingAddress.addressLine || `${data.shippingAddress.province || ''} ${data.shippingAddress.city || ''} ${data.shippingAddress.addressLine || ''}`)) : 'ثبت نشده');
    const phone = data.phone || (data.shippingAddress && data.shippingAddress.phone) || '';

    const totalPrice = data.totalPrice !== undefined 
      ? Number(data.totalPrice) 
      : products.reduce((acc, item) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);

    if (isDBConnected()) {
      const created = await Order.create({
        orderNumber: data.orderNumber || `ORD-${randomNum}`,
        userId: data.userId || 'guest-user',
        buyerName,
        address,
        phone,
        products,
        totalPrice,
        status: data.status || data.orderStatus || 'pending',
        paymentMethod: data.paymentMethod || 'online',
        paymentStatus: data.paymentStatus || 'pending',
        trackingCode: data.trackingCode || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`
      });
      return created.toObject();
    }

    const newOrder = {
      _id: data._id || db.generateId(),
      orderNumber: data.orderNumber || `ORD-${randomNum}`,
      userId: data.userId || 'guest-user',
      products: products,
      items: products,
      buyerName: buyerName,
      address: address,
      phone: phone,
      totalPrice: totalPrice,
      status: data.status || data.orderStatus || 'pending',
      paymentMethod: data.paymentMethod || 'online',
      paymentStatus: data.paymentStatus || 'pending',
      trackingCode: data.trackingCode || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    return newOrder;
  },

  findByIdAndUpdate: async (id, updateData) => {
    if (isDBConnected()) {
      if (mongoose.isValidObjectId(id)) {
        const updated = await Order.findByIdAndUpdate(id, updateData, { new: true }).lean();
        if (updated) return updated;
      }
      return await Order.findOneAndUpdate({ $or: [{ _id: id }, { orderNumber: id }] }, updateData, { new: true }).lean();
    }

    const index = db.orders.findIndex(o => o._id === id || o.orderNumber === id);
    if (index === -1) return null;

    db.orders[index] = {
      ...db.orders[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return db.orders[index];
  },

  findByIdAndDelete: async (id) => {
    if (isDBConnected()) {
      if (mongoose.isValidObjectId(id)) {
        const deleted = await Order.findByIdAndDelete(id).lean();
        if (deleted) return deleted;
      }
      return await Order.findOneAndDelete({ $or: [{ _id: id }, { orderNumber: id }] }).lean();
    }

    const index = db.orders.findIndex(o => o._id === id || o.orderNumber === id);
    if (index === -1) return null;
    const deleted = db.orders.splice(index, 1);
    return deleted[0];
  },

  countDocuments: async (query = {}) => {
    if (isDBConnected()) {
      return await Order.countDocuments(query);
    }
    const filtered = await OrderModel.find(query);
    return filtered.length;
  }
};
