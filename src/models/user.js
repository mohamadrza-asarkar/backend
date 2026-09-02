import mongoose from 'mongoose';

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
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const UserModel = User;
export default User;


