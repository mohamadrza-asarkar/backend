import { Router } from 'express';
import {
  getProducts,
  getAmazingProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from './controller.js';
import { validateProduct, validateProductUpdate } from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect, adminOnly } from '../../middlewares/auth.middleware.js';
import { uploadProduct } from '../../middlewares/upload.middleware.js';

const router = Router();

// Public product routes (Publicly accessible without auth)
router.get('/', getProducts);
router.get('/amazing', getAmazingProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin-only product routes with Multer single image upload support
router.post('/', protect, adminOnly, uploadProduct.single('image'), validateRequest(validateProduct), createProduct);
router.put('/:id', protect, adminOnly, uploadProduct.single('image'), validateRequest(validateProductUpdate), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
