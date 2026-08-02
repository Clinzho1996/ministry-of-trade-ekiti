"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/eventRoutes.ts
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public routes
router.get('/', rateLimiter_1.apiLimiter, eventController_1.getEvents);
router.get('/slug/:slug', rateLimiter_1.apiLimiter, eventController_1.getEventBySlug);
router.get('/:id', rateLimiter_1.apiLimiter, eventController_1.getEvents); // Fallback by ID
// Admin routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), upload_1.upload.single('image'), eventController_1.createEvent);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), upload_1.upload.single('image'), eventController_1.updateEvent);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), eventController_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map