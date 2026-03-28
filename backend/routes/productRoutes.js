import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAnalytics } from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/', getProducts);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/:id', getProductById);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;