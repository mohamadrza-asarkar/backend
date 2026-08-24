import { Router } from 'express';
import {
  getSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide
} from './controller.js';
import { uploadSlide } from '../../middlewares/upload.middleware.js';
import { protect, adminOnly } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getSlides);
router.get('/:id', getSlideById);

// Admin-only routes (Multer single image upload support)
router.post('/', protect, adminOnly, uploadSlide.single('image'), createSlide);
router.put('/:id', protect, adminOnly, uploadSlide.single('image'), updateSlide);
router.delete('/:id', protect, adminOnly, deleteSlide);

export default router;
