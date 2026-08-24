import { db } from './db.js';

/**
 * Cart Model - کارت / سبد خرید
 * هر کارت شامل چند محصول (products) با تعداد و مشخصات می‌باشد
 */
export const CartModel = {
  findOne: async (query = {}) => {
    let cart = null;
    if (query.userId) {
      cart = db.carts.find(c => c.userId === query.userId) || null;
    } else if (query._id) {
      cart = db.carts.find(c => c._id === query._id) || null;
    }

    if (cart) {
      // Ensure products and items sync
      const products = cart.products || cart.items || [];
      return {
        ...cart,
        products,
        items: products
      };
    }
    return null;
  },

  create: async (data) => {
    const products = data.products || data.items || [];
    const totalPrice = data.totalPrice || products.reduce((acc, item) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);

    const newCart = {
      _id: data._id || db.generateId(),
      userId: data.userId,
      products: products,
      items: products,
      totalPrice: totalPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.carts.push(newCart);
    return newCart;
  },

  findOneAndUpdate: async (query, updateData, options = {}) => {
    let cart = await CartModel.findOne(query);
    if (!cart) {
      if (options.upsert) {
        return await CartModel.create({ ...query, ...updateData });
      }
      return null;
    }

    const index = db.carts.findIndex(c => c._id === cart._id);
    const products = updateData.products || updateData.items || cart.products || cart.items || [];
    const totalPrice = updateData.totalPrice !== undefined 
      ? Number(updateData.totalPrice) 
      : products.reduce((acc, item) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);

    db.carts[index] = {
      ...db.carts[index],
      ...updateData,
      products: products,
      items: products,
      totalPrice: totalPrice,
      updatedAt: new Date().toISOString()
    };

    return db.carts[index];
  },

  deleteOne: async (query = {}) => {
    const index = db.carts.findIndex(c => {
      if (query.userId) return c.userId === query.userId;
      if (query._id) return c._id === query._id;
      return false;
    });
    if (index !== -1) {
      const deleted = db.carts.splice(index, 1);
      return deleted[0];
    }
    return null;
  }
};
