// src/routes/uploadRoutes.ts
import { Router } from "express";
import { deleteImage, uploadImage } from "../controllers/uploadController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Add a test route to verify the router is working
router.get("/test", (req, res) => {
	res.json({ message: "Upload route is working!" });
});

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
