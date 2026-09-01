import { Router } from 'express';
import {
  getAmazingProducts,
  getAmazingProductById,
  createAmazingProduct,
  updateAmazingProduct,
  deleteAmazingProduct
} from './controller.js';
import { isAdmin } from '../../middlewares/isAdmin.js';
import { uploadProduct } from '../../middlewares/upload.js';

const router = Router();

// Public routes for amazing products (بدون نیاز به توکن برای فرانت‌اند)
router.get('/', getAmazingProducts);
router.get('/:id', getAmazingProductById);

// Admin-only management with Multer/Base64 image upload
router.post('/', isAdmin, uploadProduct.single('image'), createAmazingProduct);
router.put('/:id', isAdmin, uploadProduct.single('image'), updateAmazingProduct);
router.delete('/:id', isAdmin, deleteAmazingProduct);

export default router;
