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
import { isAdmin } from '../../middlewares/isAdmin.js';
import { uploadProduct } from '../../middlewares/upload.js';

const router = Router();

// Public product routes (Publicly accessible without auth)
router.get('/', getProducts);
router.get('/amazing', getAmazingProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin-only product routes with Multer single image upload support
router.post('/', isAdmin, uploadProduct.single('image'), createProduct);
router.put('/:id', isAdmin, uploadProduct.single('image'), updateProduct);
router.delete('/:id', isAdmin, deleteProduct);

export default router;
