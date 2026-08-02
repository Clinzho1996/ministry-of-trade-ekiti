// src/routes/galleryRoutes.ts
import { Router } from "express";
import {
	createGalleryItem,
	deleteGalleryItem,
	getGalleryItems,
} from "../controllers/galleryController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", getGalleryItems);

// Admin routes
router.post(
	"/",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	createGalleryItem,
);
router.delete("/:id", authenticate, authorize("admin"), deleteGalleryItem);

export default router;
