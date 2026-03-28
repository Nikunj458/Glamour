import express from 'express';
import { getFavourites, toggleFavourite, getAllUsers } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/favourites', protect, getFavourites);
router.post('/favourites/:productId', protect, toggleFavourite);
router.get('/', protect, adminOnly, getAllUsers);

export default router;