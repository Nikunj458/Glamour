import express from 'express';
import {
  getReviews, createReview, updateReview, deleteReview,
  markHelpful, getAllReviews, toggleApproved, toggleVerified
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/product/:productId', getReviews);

// Auth required
router.post('/product/:productId',      protect, createReview);
router.put('/:reviewId',                protect, updateReview);
router.delete('/:reviewId',             protect, deleteReview);
router.post('/:reviewId/helpful',       protect, markHelpful);

// Admin only
router.get('/',                         protect, adminOnly, getAllReviews);
router.patch('/:reviewId/approve',      protect, adminOnly, toggleApproved);
router.patch('/:reviewId/verify',       protect, adminOnly, toggleVerified);

export default router;