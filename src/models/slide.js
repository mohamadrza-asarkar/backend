import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';

/**
 * Slide Mongoose Schema
 * هر اسلاید فقط شامل یک تصویر (image) است که با مالتر یا آدرس تصویر ذخیره می‌شود
 */
export const slideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const Slide = mongoose.models.Slide || mongoose.model('Slide', slideSchema);

/**
 * SlideModel Adapter
 */
export const SlideModel = {
  find: async (query = {}) => {
    if (isDBConnected()) {
      return await Slide.find(query).sort({ createdAt: -1 }).lean();
    }
    let list = [...db.slides];
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  },

  findById: async (id) => {
    if (isDBConnected()) {
      return await Slide.findById(id).lean();
    }
    return db.slides.find(s => s._id === id) || null;
  },

  create: async (data) => {
    if (isDBConnected()) {
      const created = await Slide.create(data);
      return created.toObject();
    }
    const newSlide = {
      _id: data._id || db.generateId(),
      image: data.image || '',
      createdAt: new Date().toISOString()
    };
    db.slides.push(newSlide);
    return newSlide;
  },

  findByIdAndUpdate: async (id, updateData) => {
    if (isDBConnected()) {
      return await Slide.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
    const index = db.slides.findIndex(s => s._id === id);
    if (index === -1) return null;

    db.slides[index] = {
      ...db.slides[index],
      image: updateData.image !== undefined ? updateData.image : db.slides[index].image,
      updatedAt: new Date().toISOString()
    };
    return db.slides[index];
  },

  findByIdAndDelete: async (id) => {
    if (isDBConnected()) {
      return await Slide.findByIdAndDelete(id).lean();
    }
    const index = db.slides.findIndex(s => s._id === id);
    if (index === -1) return null;
    const deleted = db.slides.splice(index, 1);
    return deleted[0];
  }
};
