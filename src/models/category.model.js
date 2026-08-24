import { db } from './db.js';

export const CategoryModel = {
  find: async () => {
    return db.categories;
  },

  findById: async (id) => {
    return db.categories.find(c => c._id === id) || null;
  },

  findBySlug: async (slug) => {
    return db.categories.find(c => c.slug === slug) || null;
  },

  create: async (data) => {
    const newCategory = {
      _id: data._id || db.generateId(),
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-'),
      icon: data.icon || 'Grid',
      image: data.image || '',
      description: data.description || '',
      createdAt: new Date().toISOString()
    };
    db.categories.push(newCategory);
    return newCategory;
  },

  findByIdAndUpdate: async (id, updateData) => {
    const index = db.categories.findIndex(c => c._id === id);
    if (index === -1) return null;

    db.categories[index] = {
      ...db.categories[index],
      ...updateData
    };
    return db.categories[index];
  },

  findByIdAndDelete: async (id) => {
    const index = db.categories.findIndex(c => c._id === id);
    if (index === -1) return null;
    const deleted = db.categories.splice(index, 1);
    return deleted[0];
  }
};
