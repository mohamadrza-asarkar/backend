import { Router } from 'express';
import {
  getProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from './controller.js';
import { validateProduct, validateProductUpdate } from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect, adminOnly } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public product routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin-only product routes
router.post('/', protect, adminOnly, validateRequest(validateProduct), createProduct);
router.put('/:id', protect, adminOnly, validateRequest(validateProductUpdate), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
