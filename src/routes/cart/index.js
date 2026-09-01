import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart
} from './controller.js';

const router = Router();

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeItemFromCart);
router.delete('/', clearCart);

export default router;
