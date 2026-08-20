// src/routes/grievanceRoutes.ts
import { Router } from "express";
import {
	deleteGrievance,
	getAllGrievances,
	getGrievanceById,
	getGrievanceStats,
	submitGrievance,
	trackGrievance,
	updateGrievanceStatus,
} from "../controllers/grievanceController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/", submitGrievance);
router.get("/track/:trackingId", trackGrievance);

// Admin routes
router.get("/", authenticate, authorize("admin", "editor"), getAllGrievances);
router.get(
	"/stats",
	authenticate,
	authorize("admin", "editor"),
	getGrievanceStats,
);
router.get(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	getGrievanceById,
);
router.put(
	"/:id/status",
	authenticate,
	authorize("admin", "editor"),
	updateGrievanceStatus,
);
router.delete("/:id", authenticate, authorize("admin"), deleteGrievance);

export default router;
