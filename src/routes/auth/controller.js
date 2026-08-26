import { UserModel } from '../../models/user.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Register a new user with Phone number & Password
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, phone, password, role, address } = req.body;
    const cleanPhone = String(phone || '').trim();

    const existingUser = await UserModel.findOne({ phone: cleanPhone });
    if (existingUser) {
      return errorResponse(res, 400, 'این شماره موبایل قبلاً در سیستم ثبت نام کرده است');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await UserModel.create({
      name: name.trim(),
      phone: cleanPhone,
      password: hashedPassword,
      address: address || '',
      role: role === 'admin' ? 'admin' : 'user'
    });

    const token = generateToken({
      id: newUser._id,
      phone: newUser.phone,
      role: newUser.role,
      name: newUser.name
    });

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      address: newUser.address,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt
    };

    return successResponse(res, 201, 'ثبت‌نام با موفقیت انجام شد', {
      user: userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login existing user with Phone number & Password
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const cleanPhone = String(phone || '').trim();

    const user = await UserModel.findOne({ phone: cleanPhone });
    if (!user) {
      return errorResponse(res, 401, 'شماره موبایل یا کلمه عبور اشتباه است');
    }

    if (user.isActive === false) {
      return errorResponse(res, 403, 'حساب کاربری شما غیرفعال شده است');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 401, 'شماره موبایل یا کلمه عبور اشتباه است');
    }

    const token = generateToken({
      id: user._id,
      phone: user.phone,
      role: user.role,
      name: user.name
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      createdAt: user.createdAt
    };

    return successResponse(res, 200, 'ورود با موفقیت انجام شد', {
      user: userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const userResponse = {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return successResponse(res, 200, 'اطلاعات پروفایل کاربر دریافت شد', { user: userResponse });
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, address } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (address !== undefined) updateData.address = address;

    if (phone) {
      const cleanPhone = String(phone).trim();
      if (cleanPhone !== req.user.phone) {
        const existing = await UserModel.findOne({ phone: cleanPhone });
        if (existing) {
          return errorResponse(res, 400, 'این شماره موبایل توسط کاربر دیگری استفاده می‌شود');
        }
        updateData.phone = cleanPhone;
      }
    }

    const updated = await UserModel.findByIdAndUpdate(req.user._id, updateData);

    return successResponse(res, 200, 'پروفایل کاربری با موفقیت به‌روزرسانی شد', {
      user: {
        _id: updated._id,
        name: updated.name,
        phone: updated.phone,
        role: updated.role,
        avatar: updated.avatar,
        address: updated.address
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user._id);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 400, 'رمز عبور فعلی نادرست است');
    }

    const hashed = await hashPassword(newPassword);
    await UserModel.findByIdAndUpdate(user._id, { password: hashed });

    return successResponse(res, 200, 'رمز عبور با موفقیت تغییر یافت');
  } catch (error) {
    next(error);
  }
};
