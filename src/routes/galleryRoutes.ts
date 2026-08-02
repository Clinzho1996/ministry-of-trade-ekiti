// src/routes/galleryRoutes.ts
import { Router } from 'express';
import { getGalleryItems, createGalleryItem, deleteGalleryItem } from '../controllers/galleryController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/', apiLimiter, getGalleryItems);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('image'),
  createGalleryItem
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteGalleryItem
);

export default router;