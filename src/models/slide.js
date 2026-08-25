import { db } from './db.js';

/**
 * Slide Model - اسلاید
 * هر اسلاید فقط شامل یک تصویر است که با مالتر یا آدرس تصویر ذخیره می‌شود
 */
export const SlideModel = {
  find: async (query = {}) => {
    let list = [...db.slides];
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return list;
  },

  findById: async (id) => {
    return db.slides.find(s => s._id === id) || null;
  },

  create: async (data) => {
    const newSlide = {
      _id: data._id || db.generateId(),
      image: data.image || '',
      createdAt: new Date().toISOString()
    };
    db.slides.push(newSlide);
    return newSlide;
  },

  findByIdAndUpdate: async (id, updateData) => {
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
    const index = db.slides.findIndex(s => s._id === id);
    if (index === -1) return null;
    const deleted = db.slides.splice(index, 1);
    return deleted[0];
  }
};
