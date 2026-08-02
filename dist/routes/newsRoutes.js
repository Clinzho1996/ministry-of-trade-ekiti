"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/newsRoutes.ts
const express_1 = require("express");
const newsController_1 = require("../controllers/newsController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Public routes
router.get('/', newsController_1.getNews);
router.get('/slug/:slug', newsController_1.getNewsBySlug);
router.get('/:id', newsController_1.getNews); // Fallback by ID
// Admin routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), upload_1.upload.single('image'), newsController_1.createNews);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'editor'), upload_1.upload.single('image'), newsController_1.updateNews);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), newsController_1.deleteNews);
exports.default = router;
//# sourceMappingURL=newsRoutes.js.map