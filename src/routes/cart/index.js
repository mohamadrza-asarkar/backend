import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart
} from './controller.js';
import { validateCartItem, validateUpdateCartItem } from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { optionalAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Apply optionalAuth so logged in users have their cart tied to their account
router.use(optionalAuth);

router.get('/', getCart);
router.post('/items', validateRequest(validateCartItem), addItemToCart);
router.put('/items/:productId', validateRequest(validateUpdateCartItem), updateCartItem);
router.delete('/items/:productId', removeItemFromCart);
router.delete('/', clearCart);

export default router;
