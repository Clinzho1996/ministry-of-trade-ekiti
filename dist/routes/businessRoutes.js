"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/businessRoutes.ts
const express_1 = require("express");
const businessController_1 = require("../controllers/businessController");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", rateLimiter_1.apiLimiter, businessController_1.getBusinesses);
router.get("/categories", rateLimiter_1.apiLimiter, businessController_1.getBusinessCategories);
router.get("/slug/:slug", rateLimiter_1.apiLimiter, businessController_1.getBusinessBySlug);
router.get("/:id", rateLimiter_1.apiLimiter, businessController_1.getBusiness);
// Admin routes
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("logo"), businessController_1.createBusiness);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("logo"), businessController_1.updateBusiness);
router.post("/:id/images", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.array("images", 10), businessController_1.uploadBusinessImages);
router.delete("/:id/images", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), businessController_1.deleteBusinessImage);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), businessController_1.deleteBusiness);
exports.default = router;
//# sourceMappingURL=businessRoutes.js.map