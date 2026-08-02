// src/routes/opportunityRoutes.ts
import { Router } from 'express';
import {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../controllers/opportunityController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/', apiLimiter, getOpportunities);
router.get('/:id', apiLimiter, getOpportunity);

// Admin routes
router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('image'),
  createOpportunity
);
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'editor'),
  upload.single('image'),
  updateOpportunity
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteOpportunity
);

export default router;