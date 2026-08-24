import { db } from './db.js';

export const UserModel = {
  find: async (query = {}) => {
    let result = db.users;
    if (query.role) {
      result = result.filter(u => u.role === query.role);
    }
    if (query.email) {
      result = result.filter(u => u.email.toLowerCase() === query.email.toLowerCase());
    }
    return result;
  },

  findOne: async (query = {}) => {
    if (query._id) {
      return db.users.find(u => u._id === query._id) || null;
    }
    if (query.email) {
      return db.users.find(u => u.email.toLowerCase() === query.email.toLowerCase()) || null;
    }
    return null;
  },

  findById: async (id) => {
    return db.users.find(u => u._id === id) || null;
  },

  create: async (userData) => {
    const newUser = {
      _id: userData._id || db.generateId(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || 'user',
      phone: userData.phone || '',
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      address: userData.address || {
        province: '',
        city: '',
        postalCode: '',
        addressLine: ''
      },
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    return newUser;
  },

  findByIdAndUpdate: async (id, updateData) => {
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
    const index = db.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    const deleted = db.users.splice(index, 1);
    return deleted[0];
  },

  countDocuments: async (query = {}) => {
    if (query.role) {
      return db.users.filter(u => u.role === query.role).length;
    }
    return db.users.length;
  }
};
