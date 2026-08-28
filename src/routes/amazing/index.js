import { Router } from 'express';
import {
  getAmazingProducts,
  getAmazingProductById,
  createAmazingProduct,
  updateAmazingProduct,
  deleteAmazingProduct
} from './controller.js';
import { validateProduct, validateProductUpdate } from '../products/validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect, adminOnly } from '../../middlewares/auth.middleware.js';
import { uploadProduct } from '../../middlewares/upload.middleware.js';

const router = Router();

// Public routes for amazing products (بدون نیاز به توکن برای فرانت‌اند)
router.get('/', getAmazingProducts);
router.get('/:id', getAmazingProductById);

// Admin-only management with Multer/Base64 image upload
router.post('/', protect, adminOnly, uploadProduct.single('image'), validateRequest(validateProduct), createAmazingProduct);
router.put('/:id', protect, adminOnly, uploadProduct.single('image'), validateRequest(validateProductUpdate), updateAmazingProduct);
router.delete('/:id', protect, adminOnly, deleteAmazingProduct);

export default router;
