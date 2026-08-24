import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getAllOrders
} from './controller.js';
import { validateUpdateUserRole } from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect, adminOnly } from '../../middlewares/auth.middleware.js';

const router = Router();

// All admin routes require admin authentication
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', validateRequest(validateUpdateUserRole), updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/orders', getAllOrders);

export default router;
