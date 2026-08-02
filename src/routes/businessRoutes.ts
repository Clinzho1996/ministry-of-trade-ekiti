// src/routes/businessRoutes.ts
import { Router } from "express";
import {
	createBusiness,
	deleteBusiness,
	deleteBusinessImage,
	getBusiness,
	getBusinessBySlug,
	getBusinessCategories,
	getBusinesses,
	updateBusiness,
	uploadBusinessImages,
} from "../controllers/businessController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public rou
router.get("/", getBusinesses);
router.get("/categories", getBusinessCategories);
router.get("/slug/:slug", getBusinessBySlug);
router.get("/:id", getBusiness);

// Admin routes
router.post(
	"/",
	authenticate,
	authorize("admin", "editor"),
	upload.single("logo"),
	createBusiness,
);
router.put(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	upload.single("logo"),
	updateBusiness,
);
router.post(
	"/:id/images",
	authenticate,
	authorize("admin", "editor"),
	upload.array("images", 10),
	uploadBusinessImages,
);
router.delete(
	"/:id/images",
	authenticate,
	authorize("admin", "editor"),
	deleteBusinessImage,
);
router.delete("/:id", authenticate, authorize("admin"), deleteBusiness);

export default router;
