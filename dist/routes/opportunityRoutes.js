"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/opportunityRoutes.ts
const express_1 = require("express");
const opportunityController_1 = require("../controllers/opportunityController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public routes
router.get('/', rateLimiter_1.apiLimiter, opportunityController_1.getOpportunities);
router.get('/:id', rateLimiter_1.apiLimiter, opportunityController_1.getOpportunity);
// Admin routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), upload_1.upload.single('image'), opportunityController_1.createOpportunity);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), upload_1.upload.single('image'), opportunityController_1.updateOpportunity);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), opportunityController_1.deleteOpportunity);
exports.default = router;
//# sourceMappingURL=opportunityRoutes.js.map