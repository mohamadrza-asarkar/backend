import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';
import { saveBase64ToFile } from '../utils/format.js';

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
    const prepared = { ...data };
    if (prepared.image && prepared.image.startsWith('data:')) {
      prepared.image = saveBase64ToFile(prepared.image, 'slides');
    }
    if (isDBConnected()) {
      const created = await Slide.create(prepared);
      return created.toObject();
    }
    const newSlide = {
      _id: prepared._id || db.generateId(),
      image: prepared.image || '',
      createdAt: new Date().toISOString()
    };
    db.slides.push(newSlide);
    return newSlide;
  },

  findByIdAndUpdate: async (id, updateData) => {
    const prepared = { ...updateData };
    if (prepared.image && prepared.image.startsWith('data:')) {
      prepared.image = saveBase64ToFile(prepared.image, 'slides');
    }
    if (isDBConnected()) {
      return await Slide.findByIdAndUpdate(id, prepared, { new: true }).lean();
    }
    const index = db.slides.findIndex(s => s._id === id);
    if (index === -1) return null;

    db.slides[index] = {
      ...db.slides[index],
      image: prepared.image !== undefined ? prepared.image : db.slides[index].image,
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
