import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  payOrder,
  updateOrderStatus
} from './controller.js';
import { validateCreateOrder, validateUpdateOrderStatus } from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect, adminOnly } from '../../middlewares/auth.middleware.js';

const router = Router();

// All order operations require authentication
router.use(protect);

router.post('/', validateRequest(validateCreateOrder), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/pay', payOrder);

// Admin-only order status update
router.put('/:id/status', adminOnly, validateRequest(validateUpdateOrderStatus), updateOrderStatus);

export default router;
