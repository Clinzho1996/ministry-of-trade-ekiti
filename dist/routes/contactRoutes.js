"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/contactRoutes.ts
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public route - submit contact form
router.post('/', rateLimiter_1.contactLimiter, contactController_1.submitContact);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), rateLimiter_1.apiLimiter, contactController_1.getContacts);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), contactController_1.getContact);
router.put('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), contactController_1.updateContactStatus);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), contactController_1.deleteContact);
exports.default = router;
//# sourceMappingURL=contactRoutes.js.map