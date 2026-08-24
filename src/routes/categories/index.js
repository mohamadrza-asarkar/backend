import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from './controller.js';
import { validateCategory } from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect, adminOnly } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public category routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin category routes
router.post('/', protect, adminOnly, validateRequest(validateCategory), createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
