import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  replyReview,
  deleteReview
} from './controller.js';
import { isAuth } from '../../middlewares/isAuth.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

// Public routes
router.get('/', getProductReviews);

// Protected routes
router.post('/', isAuth, createReview);

// Admin-only routes
router.post('/:id/reply', isAdmin, replyReview);
router.delete('/:id', isAdmin, deleteReview);

export default router;
