import { db } from './db.js';

/**
 * Order Model - سفارش
 * هر سفارش شامل: محصولات (products)، نام و نام‌خانوادگی خریدار (buyerName)،
 * آدرس (address) و شماره تلفن خریدار (phone) می‌باشد.
 */
export const OrderModel = {
  find: async (query = {}) => {
    let list = [...db.orders];
    if (query.userId) {
      list = list.filter(o => o.userId === query.userId);
    }
    if (query.status || query.orderStatus) {
      const st = query.status || query.orderStatus;
      list = list.filter(o => (o.status === st || o.orderStatus === st));
    }
    if (query.phone) {
      list = list.filter(o => o.phone === query.phone || (o.shippingAddress && o.shippingAddress.phone === query.phone));
    }
    // Sort desc
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  },

  findById: async (id) => {
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
    const index = db.orders.findIndex(o => o._id === id || o.orderNumber === id);
    if (index === -1) return null;
    const deleted = db.orders.splice(index, 1);
    return deleted[0];
  },

  countDocuments: async (query = {}) => {
    const filtered = await OrderModel.find(query);
    return filtered.length;
  }
};
