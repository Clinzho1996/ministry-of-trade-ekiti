"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/galleryRoutes.ts
const express_1 = require("express");
const galleryController_1 = require("../controllers/galleryController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", galleryController_1.getGalleryItems);
// Admin routes
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("image"), galleryController_1.createGalleryItem);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), galleryController_1.deleteGalleryItem);
exports.default = router;
//# sourceMappingURL=galleryRoutes.js.map