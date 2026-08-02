// src/routes/newsRoutes.ts
import { Router } from 'express';
import {
  getNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/', apiLimiter, getNews);
router.get('/slug/:slug', apiLimiter, getNewsBySlug);
router.get('/:id', apiLimiter, getNews); // Fallback by ID

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('image'),
  createNews
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('image'),
  updateNews
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteNews
);

export default router;