// src/routes/uploadRoutes.ts
import { Router } from "express";
import { deleteImage, uploadImage } from "../controllers/uploadController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Upload image (admin/editor only)
router.post(
	"/",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	uploadImage,
);

// Delete image (admin/editor only)
router.delete("/", authenticate, authorize("admin", "editor"), deleteImage);

export default router;
