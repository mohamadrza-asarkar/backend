import { Router } from 'express';
import {
  getSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide
} from './controller.js';
import { uploadSlide } from '../../middlewares/upload.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

// Public routes
router.get('/', getSlides);
router.get('/:id', getSlideById);

// Admin-only routes (Multer single image upload support)
router.post('/', isAdmin, uploadSlide.single('image'), createSlide);
router.put('/:id', isAdmin, uploadSlide.single('image'), updateSlide);
router.delete('/:id', isAdmin, deleteSlide);

export default router;
