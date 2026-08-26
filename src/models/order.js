import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';

/**
 * Order Product Sub-Schema
 * هر آیتم سفارش شامل مشخصات محصول (productId, name, price, quantity, image, product) است
 */
export const orderProductSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, default: '' },
  product: { type: mongoose.Schema.Types.Mixed }
}, { _id: false, strict: false });

/**
 * Order Mongoose Schema
 * مدل سفارش:
 * هر سفارش حتماً شامل یک یا چند محصول (products/items)، مشخصات خریدار (buyerName, address, phone) و مبلغ کل (totalPrice) است.
 */
export const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, default: () => `ORD-${Math.floor(10000 + Math.random() * 90000)}` },
  userId: { type: String, default: 'guest-user' },
  buyerName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  products: [orderProductSchema],
  items: [orderProductSchema],
  totalPrice: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, default: 'online' },
  paymentStatus: { type: String, default: 'pending' },
  trackingCode: { type: String, default: () => `TRK-${Math.floor(10000000 + Math.random() * 90000000)}` },
  notes: { type: String, default: '' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  strict: false
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
      const list = await Order.find(mongoQuery).sort({ createdAt: -1 }).lean();
      return list.map(o => ({
        ...o,
        products: o.products && o.products.length > 0 ? o.products : (o.items || []),
        items: o.items && o.items.length > 0 ? o.items : (o.products || [])
      }));
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
    return list.map(o => ({
      ...o,
      products: o.products && o.products.length > 0 ? o.products : (o.items || []),
      items: o.items && o.items.length > 0 ? o.items : (o.products || [])
    }));
  },

  findById: async (id) => {
    if (isDBConnected()) {
      let order = null;
      if (mongoose.isValidObjectId(id)) {
        order = await Order.findById(id).lean();
      }
      if (!order) {
        order = await Order.findOne({ $or: [{ _id: id }, { orderNumber: id }] }).lean();
      }
      if (!order) return null;
      return {
        ...order,
        products: order.products && order.products.length > 0 ? order.products : (order.items || []),
        items: order.items && order.items.length > 0 ? order.items : (order.products || [])
      };
    }
    const order = db.orders.find(o => o._id === id || o.orderNumber === id) || null;
    if (!order) return null;
    return {
      ...order,
      products: order.products && order.products.length > 0 ? order.products : (order.items || []),
      items: order.items && order.items.length > 0 ? order.items : (order.products || [])
    };
  },

  create: async (data) => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const rawProducts = data.products || data.items || [];
    const buyerName = data.buyerName || (data.shippingAddress && data.shippingAddress.fullName) || data.userName || 'خریدار';
    const address = data.address || (data.shippingAddress ? (typeof data.shippingAddress === 'string' ? data.shippingAddress : (data.shippingAddress.addressLine || `${data.shippingAddress.province || ''} ${data.shippingAddress.city || ''} ${data.shippingAddress.addressLine || ''}`)) : 'ثبت نشده');
    const phone = data.phone || (data.shippingAddress && data.shippingAddress.phone) || '';

    const totalPrice = data.totalPrice !== undefined 
      ? Number(data.totalPrice) 
      : rawProducts.reduce((acc, item) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);

    if (isDBConnected()) {
      const created = await Order.create({
        orderNumber: data.orderNumber || `ORD-${randomNum}`,
        userId: data.userId || 'guest-user',
        buyerName,
        address,
        phone,
        products: rawProducts,
        items: rawProducts,
        totalPrice,
        status: data.status || data.orderStatus || 'pending',
        paymentMethod: data.paymentMethod || 'online',
        paymentStatus: data.paymentStatus || 'pending',
        trackingCode: data.trackingCode || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: data.notes || ''
      });
      const obj = created.toObject();
      return {
        ...obj,
        products: rawProducts,
        items: rawProducts
      };
    }

    const newOrder = {
      _id: data._id || db.generateId(),
      orderNumber: data.orderNumber || `ORD-${randomNum}`,
      userId: data.userId || 'guest-user',
      products: rawProducts,
      items: rawProducts,
      buyerName: buyerName,
      address: address,
      phone: phone,
      totalPrice: totalPrice,
      status: data.status || data.orderStatus || 'pending',
      paymentMethod: data.paymentMethod || 'online',
      paymentStatus: data.paymentStatus || 'pending',
      trackingCode: data.trackingCode || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder);
    return newOrder;
  },

  findByIdAndUpdate: async (id, updateData) => {
    if (isDBConnected()) {
      let updated = null;
      if (mongoose.isValidObjectId(id)) {
        updated = await Order.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      if (!updated) {
        updated = await Order.findOneAndUpdate({ $or: [{ _id: id }, { orderNumber: id }] }, updateData, { new: true }).lean();
      }
      if (!updated) return null;
      return {
        ...updated,
        products: updated.products && updated.products.length > 0 ? updated.products : (updated.items || []),
        items: updated.items && updated.items.length > 0 ? updated.items : (updated.products || [])
      };
    }

    const index = db.orders.findIndex(o => o._id === id || o.orderNumber === id);
    if (index === -1) return null;

    db.orders[index] = {
      ...db.orders[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return {
      ...db.orders[index],
      products: db.orders[index].products && db.orders[index].products.length > 0 ? db.orders[index].products : (db.orders[index].items || []),
      items: db.orders[index].items && db.orders[index].items.length > 0 ? db.orders[index].items : (db.orders[index].products || [])
    };
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
