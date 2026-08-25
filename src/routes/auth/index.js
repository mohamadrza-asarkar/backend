import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} from './controller.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimit.middleware.js';

const router = Router();

// Public routes with rate limiting protection
router.post('/register', authLimiter, validateRequest(validateRegister), register);
router.post('/login', authLimiter, validateRequest(validateLogin), login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateRequest(validateUpdateProfile), updateProfile);
router.put('/change-password', protect, validateRequest(validateChangePassword), changePassword);

export default router;
