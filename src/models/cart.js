import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';

/**
 * Cart Item Sub-Schema
 */
export const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1, min: 1 },
  totalPrice: { type: Number, default: 0 },
  image: { type: String }
}, { _id: false });

/**
 * Cart Mongoose Schema
 * کارت / سبد خرید شامل چند محصول (products) با تعداد و قیمت کل
 */
export const cartSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  products: [cartItemSchema],
  totalPrice: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

/**
 * CartModel Adapter
 */
export const CartModel = {
  findOne: async (query = {}) => {
    if (isDBConnected()) {
      const cart = await Cart.findOne(query).lean();
      if (cart) {
        return {
          ...cart,
          products: cart.products || [],
          items: cart.products || []
        };
      }
      return null;
    }

    let cart = null;
    if (query.userId) {
      cart = db.carts.find(c => c.userId === query.userId) || null;
    } else if (query._id) {
      cart = db.carts.find(c => c._id === query._id) || null;
    }

    if (cart) {
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
    const totalPrice = data.totalPrice !== undefined 
      ? data.totalPrice 
      : products.reduce((acc, item) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);

    if (isDBConnected()) {
      const created = await Cart.create({
        userId: data.userId || 'guest',
        products,
        totalPrice
      });
      return created.toObject();
    }

    const newCart = {
      _id: data._id || db.generateId(),
      userId: data.userId || 'guest',
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
    if (isDBConnected()) {
      const products = updateData.products || updateData.items;
      if (products && updateData.totalPrice === undefined) {
        updateData.totalPrice = products.reduce((acc, item) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);
      }
      return await Cart.findOneAndUpdate(query, updateData, { new: true, upsert: options.upsert || false }).lean();
    }

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
    if (isDBConnected()) {
      return await Cart.deleteOne(query);
    }
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
