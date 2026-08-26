import mongoose from 'mongoose';
import { db } from './db.js';
import { isDBConnected } from '../config/database.js';

/**
 * User Mongoose Schema
 * احراز هویت و مدیریت کاربران بر اساس شماره تماس (phone) و رمز عبور (password)
 */
export const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    index: true 
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

/**
 * UserModel Adapter - delegates to Mongoose or In-Memory fallback
 */
export const UserModel = {
  find: async (query = {}) => {
    if (isDBConnected()) {
      return await User.find(query).lean();
    }
    let result = db.users;
    if (query.role) {
      result = result.filter(u => u.role === query.role);
    }
    if (query.phone) {
      result = result.filter(u => u.phone === query.phone);
    }
    return result;
  },

  findOne: async (query = {}) => {
    if (isDBConnected()) {
      return await User.findOne(query).lean();
    }
    if (query._id) {
      return db.users.find(u => u._id === query._id) || null;
    }
    if (query.phone) {
      return db.users.find(u => u.phone === query.phone) || null;
    }
    return null;
  },

  findById: async (id) => {
    if (isDBConnected()) {
      return await User.findById(id).lean();
    }
    return db.users.find(u => u._id === id) || null;
  },

  create: async (userData) => {
    const formattedPhone = String(userData.phone || '').trim();
    if (isDBConnected()) {
      const user = await User.create({
        ...userData,
        phone: formattedPhone
      });
      return user.toObject();
    }
    const newUser = {
      _id: userData._id || db.generateId(),
      name: userData.name,
      phone: formattedPhone,
      password: userData.password,
      role: userData.role || 'user',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      address: userData.address || '',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    return newUser;
  },

  findByIdAndUpdate: async (id, updateData, options = { new: true }) => {
    if (isDBConnected()) {
      return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    }
    const index = db.users.findIndex(u => u._id === id);
    if (index === -1) return null;

    db.users[index] = {
      ...db.users[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return db.users[index];
  },

  findByIdAndDelete: async (id) => {
    if (isDBConnected()) {
      return await User.findByIdAndDelete(id).lean();
    }
    const index = db.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    const deleted = db.users.splice(index, 1);
    return deleted[0];
  },

  countDocuments: async (query = {}) => {
    if (isDBConnected()) {
      return await User.countDocuments(query);
    }
    if (query.role) {
      return db.users.filter(u => u.role === query.role).length;
    }
    return db.users.length;
  }
};
