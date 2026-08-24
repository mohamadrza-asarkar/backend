import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  replyReview,
  deleteReview
} from './controller.js';
import { validateCreateReview, validateReplyReview } from './validation.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { protect, adminOnly, optionalAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public / optionally authenticated
router.get('/', optionalAuth, getProductReviews);

// Protected routes
router.post('/', protect, validateRequest(validateCreateReview), createReview);

// Admin-only routes
router.post('/:id/reply', protect, adminOnly, validateRequest(validateReplyReview), replyReview);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
