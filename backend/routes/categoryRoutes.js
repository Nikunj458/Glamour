import express from 'express';
import {
  getCategories, createCategory, updateCategory,
  deleteCategory, seedCategories
} from '../controllers/categoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',          getCategories);                              // public
router.post('/',         protect, adminOnly, createCategory);         // admin
router.put('/:id',       protect, adminOnly, updateCategory);         // admin
router.delete('/:id',    protect, adminOnly, deleteCategory);         // admin
router.post('/seed',     protect, adminOnly, seedCategories);         // admin — seed defaults

export default router;