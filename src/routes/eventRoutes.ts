// src/routes/eventRoutes.ts
import { Router } from 'express';
import {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/', apiLimiter, getEvents);
router.get('/slug/:slug', apiLimiter, getEventBySlug);
router.get('/:id', apiLimiter, getEvents); // Fallback by ID

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('image'),
  createEvent
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('image'),
  updateEvent
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteEvent
);

export default router;