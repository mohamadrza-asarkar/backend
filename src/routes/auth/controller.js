import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/user.js';

const jwtKey = process.env.JWT_SECRET || 'ecommerce_secret_jwt_key_2025_safe_and_secure';

// ثبت‌نام کاربر
export const register = async (req, res) => {
  try {
    const { name, phone, password, address } = req.body;
    const cleanPhone = String(phone || '').trim();

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return res.status(400).json({ message: 'این شماره موبایل قبلاً ثبت شده است' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name?.trim() || 'کاربر',
      phone: cleanPhone,
      password: hashedPassword,
      address: address || '',
      role: 'user'
    });

    const token = jwt.sign({ id: user._id, phone: user.phone, role: user.role, admin: user.role === 'admin' }, jwtKey);
    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ورود کاربر
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleanPhone = String(phone || '').trim();

    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(401).json({ message: 'شماره موبایل یا رمز عبور اشتباه است' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'شماره موبایل یا رمز عبور اشتباه است' });
    }

    const token = jwt.sign({ id: user._id, phone: user.phone, role: user.role, admin: user.role === 'admin' }, jwtKey);
    const userData = user.toObject();
    delete userData.password;

    return res.json({
      user: userData,
      token
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// اطلاعات کاربر لاگین شده
export const getMe = async (req, res) => {
  const user = req.user;
  const userData = user.toObject ? user.toObject() : { ...user };
  delete userData.password;
  return res.json({ user: userData });
};

// ویرایش پروفایل
export const updateProfile = async (req, res) => {
  try {
    const { name, address, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(req.user._id, { name, address, avatar }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    const userData = updated.toObject();
    delete userData.password;
    return res.json({ user: userData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// تغییر رمز عبور
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'رمز عبور فعلی اشتباه است' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    return res.json({ success: true, message: 'رمز عبور با موفقیت تغییر یافت' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
