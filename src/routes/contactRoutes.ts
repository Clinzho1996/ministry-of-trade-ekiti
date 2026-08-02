// src/routes/contactRoutes.ts
import { Router } from 'express';
import {
  submitContact,
  getContacts,
  getContact,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController';
import { authenticate, authorize } from '../middleware/auth';
import { contactLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public route - submit contact form
router.post('/', contactLimiter, submitContact);

// Admin routes
router.get('/', authenticate, authorize('admin', 'editor'), apiLimiter, getContacts);
router.get('/:id', authenticate, authorize('admin', 'editor'), getContact);
router.put('/:id/status', authenticate, authorize('admin', 'editor'), updateContactStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteContact);

export default router;