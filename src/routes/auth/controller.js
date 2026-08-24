import { UserModel } from '../../models/user.model.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/jwt.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'این ایمیل قبلاً در سیستم ثبت نام کرده است');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role === 'admin' ? 'admin' : 'user' // allow role selection or default to user
    });

    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
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
 * Login existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return errorResponse(res, 401, 'ایمیل یا کلمه عبور اشتباه است');
    }

    if (user.isActive === false) {
      return errorResponse(res, 403, 'حساب کاربری شما غیرفعال شده است');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 401, 'ایمیل یا کلمه عبور اشتباه است');
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
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
      email: user.email,
      role: user.role,
      phone: user.phone,
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
    const updated = await UserModel.findByIdAndUpdate(req.user._id, {
      name: name || req.user.name,
      phone: phone !== undefined ? phone : req.user.phone,
      avatar: avatar || req.user.avatar,
      address: address || req.user.address
    });

    return successResponse(res, 200, 'پروفایل کاربری با موفقیت به‌روزرسانی شد', {
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
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
