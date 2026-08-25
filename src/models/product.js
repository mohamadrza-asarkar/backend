import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';

/**
 * Review Sub-Schema for Product
 */
export const reviewSubSchema = new mongoose.Schema({
  productId: { type: String },
  sender: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

/**
 * Product Mongoose Schema
 * مدل محصول (برنج، نیم دانه برنج، ریز دانه برنج)
 * شامل: اسم (name)، توضیحات (description)، قیمت (price)، وضعیت موجودی (isAvailable) و نظرات (reviews)
 */
export const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
  countInStock: { type: Number, default: 0, min: 0 },
  image: { type: String, default: '' },
  reviews: [reviewSubSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

/**
 * ProductModel Adapter
 */
export const ProductModel = {
  find: async (filter = {}) => {
    if (isDBConnected()) {
      const mongoQuery = {};

      const searchTerm = filter.search || filter.q;
      if (searchTerm) {
        mongoQuery.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      if (filter.isAvailable !== undefined) {
        mongoQuery.isAvailable = filter.isAvailable === 'true' || filter.isAvailable === true;
      }

      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        mongoQuery.price = {};
        if (filter.minPrice !== undefined && !isNaN(Number(filter.minPrice))) {
          mongoQuery.price.$gte = Number(filter.minPrice);
        }
        if (filter.maxPrice !== undefined && !isNaN(Number(filter.maxPrice))) {
          mongoQuery.price.$lte = Number(filter.maxPrice);
        }
      }

      let query = Product.find(mongoQuery);

      if (filter.sortBy) {
        if (filter.sortBy === 'price-asc' || filter.sortBy === 'cheapest') {
          query = query.sort({ price: 1 });
        } else if (filter.sortBy === 'price-desc' || filter.sortBy === 'expensive') {
          query = query.sort({ price: -1 });
        } else if (filter.sortBy === 'newest') {
          query = query.sort({ createdAt: -1 });
        }
      } else {
        query = query.sort({ createdAt: -1 });
      }

      return await query.lean();
    }

    // In-memory fallback
    let list = [...db.products];

    const searchTerm = filter.search || filter.q;
    if (searchTerm) {
      const q = String(searchTerm).trim().toLowerCase();
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (filter.isAvailable !== undefined) {
      const isAvail = filter.isAvailable === 'true' || filter.isAvailable === true;
      list = list.filter(p => Boolean(p.isAvailable) === isAvail);
    }

    if (filter.minPrice !== undefined && !isNaN(Number(filter.minPrice))) {
      list = list.filter(p => p.price >= Number(filter.minPrice));
    }
    if (filter.maxPrice !== undefined && !isNaN(Number(filter.maxPrice))) {
      list = list.filter(p => p.price <= Number(filter.maxPrice));
    }

    list = list.map(prod => {
      const productReviews = db.reviews.filter(r => r.productId === prod._id);
      return {
        _id: prod._id,
        name: prod.name,
        description: prod.description || '',
        price: Number(prod.price) || 0,
        isAvailable: prod.isAvailable !== undefined ? Boolean(prod.isAvailable) : (Number(prod.countInStock) > 0),
        countInStock: prod.countInStock !== undefined ? Number(prod.countInStock) : 0,
        image: prod.image || '',
        reviews: productReviews.length > 0 ? productReviews : (prod.reviews || []),
        createdAt: prod.createdAt || new Date().toISOString(),
        updatedAt: prod.updatedAt || new Date().toISOString()
      };
    });

    if (filter.sortBy) {
      if (filter.sortBy === 'price-asc' || filter.sortBy === 'cheapest') {
        list.sort((a, b) => a.price - b.price);
      } else if (filter.sortBy === 'price-desc' || filter.sortBy === 'expensive') {
        list.sort((a, b) => b.price - a.price);
      } else if (filter.sortBy === 'newest') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return list;
  },

  findById: async (id) => {
    if (isDBConnected()) {
      return await Product.findById(id).lean();
    }
    const prod = db.products.find(p => p._id === id);
    if (!prod) return null;

    const productReviews = db.reviews.filter(r => r.productId === prod._id);
    return {
      _id: prod._id,
      name: prod.name,
      description: prod.description || '',
      price: Number(prod.price) || 0,
      isAvailable: prod.isAvailable !== undefined ? Boolean(prod.isAvailable) : (Number(prod.countInStock) > 0),
      countInStock: prod.countInStock !== undefined ? Number(prod.countInStock) : 0,
      image: prod.image || '',
      reviews: productReviews.length > 0 ? productReviews : (prod.reviews || []),
      createdAt: prod.createdAt || new Date().toISOString(),
      updatedAt: prod.updatedAt || new Date().toISOString()
    };
  },

  create: async (data) => {
    if (isDBConnected()) {
      const created = await Product.create(data);
      return created.toObject();
    }
    const productName = data.name || 'محصول برنج';
    const isAvailable = data.isAvailable !== undefined 
      ? Boolean(data.isAvailable) 
      : (data.countInStock !== undefined ? Number(data.countInStock) > 0 : true);

    const newProduct = {
      _id: data._id || db.generateId(),
      name: productName,
      description: data.description || '',
      price: Number(data.price) || 0,
      isAvailable: isAvailable,
      countInStock: Number(data.countInStock) || 0,
      image: data.image || '',
      reviews: data.reviews || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(newProduct);
    return newProduct;
  },

  findByIdAndUpdate: async (id, updateData) => {
    if (isDBConnected()) {
      return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    }
    const index = db.products.findIndex(p => p._id === id);
    if (index === -1) return null;

    const current = db.products[index];
    const updatedName = updateData.name || current.name;
    const isAvailable = updateData.isAvailable !== undefined 
      ? Boolean(updateData.isAvailable) 
      : (updateData.countInStock !== undefined ? Number(updateData.countInStock) > 0 : current.isAvailable);

    db.products[index] = {
      ...current,
      ...updateData,
      name: updatedName,
      isAvailable: isAvailable,
      countInStock: updateData.countInStock !== undefined ? Number(updateData.countInStock) : current.countInStock,
      updatedAt: new Date().toISOString()
    };

    const productReviews = db.reviews.filter(r => r.productId === db.products[index]._id);
    return {
      ...db.products[index],
      reviews: productReviews.length > 0 ? productReviews : (db.products[index].reviews || [])
    };
  },

  findByIdAndDelete: async (id) => {
    if (isDBConnected()) {
      return await Product.findByIdAndDelete(id).lean();
    }
    const index = db.products.findIndex(p => p._id === id);
    if (index === -1) return null;
    const deleted = db.products.splice(index, 1);
    return deleted[0];
  },

  countDocuments: async (filter = {}) => {
    if (isDBConnected()) {
      return await Product.countDocuments(filter);
    }
    const filtered = await ProductModel.find(filter);
    return filtered.length;
  }
};
