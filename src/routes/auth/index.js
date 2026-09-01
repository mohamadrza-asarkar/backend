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
  validateLogin
} from './validation.js';
import { validateRequest } from '../../middlewares/validate.js';
import { isAuth } from '../../middlewares/isAuth.js';
import { authLimiter } from '../../middlewares/rateLimit.js';

const router = Router();

// Public routes with rate limiting protection and validation
router.post('/register', authLimiter, validateRequest(validateRegister), register);
router.post('/login', authLimiter, validateRequest(validateLogin), login);

// Protected routes
router.get('/me', isAuth, getMe);
router.put('/profile', isAuth, updateProfile);
router.put('/change-password', isAuth, changePassword);

export default router;
