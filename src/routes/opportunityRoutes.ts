// src/routes/opportunityRoutes.ts
import { Router } from "express";
import {
	createOpportunity,
	deleteOpportunity,
	getOpportunities,
	getOpportunity,
	updateOpportunity,
} from "../controllers/opportunityController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", getOpportunities);
router.get("/:id", getOpportunity);

// Admin routes
router.post(
	"/",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	createOpportunity,
);
router.put(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	updateOpportunity,
);
router.delete("/:id", authenticate, authorize("admin"), deleteOpportunity);

export default router;
