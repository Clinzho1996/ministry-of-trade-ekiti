// src/routes/enrollmentRoutes.ts
import { Router } from "express";
import {
	deleteEnrollment,
	getAllEnrollments,
	getEnrollmentById,
	getEnrollmentStats,
	getUserEnrollments,
	updateEnrollmentStatus,
} from "../controllers/enrollmentController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// User routes - accessible to authenticated users
router.get("/user", authenticate, getUserEnrollments);
router.put("/:id/progress", authenticate, updateEnrollmentStatus); // Users can update their own progress

// Admin routes
router.get("/", authenticate, authorize("admin", "editor"), getAllEnrollments);
router.get(
	"/stats",
	authenticate,
	authorize("admin", "editor"),
	getEnrollmentStats,
);
router.get(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	getEnrollmentById,
);
router.put(
	"/:id/status",
	authenticate,
	authorize("admin", "editor"),
	updateEnrollmentStatus,
);
router.delete("/:id", authenticate, authorize("admin"), deleteEnrollment);

export default router;
