import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  getAllOrders
} from './controller.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

// All admin routes require admin authentication
router.use(isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/orders', getAllOrders);

export default router;
