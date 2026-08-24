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

const router = Router();

// Public routes
router.post('/register', validateRequest(validateRegister), register);
router.post('/login', validateRequest(validateLogin), login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateRequest(validateUpdateProfile), updateProfile);
router.put('/change-password', protect, validateRequest(validateChangePassword), changePassword);

export default router;
