// src/routes/courseRoutes.ts
import { Router } from "express";
import {
	createCourse,
	deleteCourse,
	enrollUser,
	getCourseBySlug,
	getCourseEnrollments,
	getCourses,
	getUserCertificates,
	updateCourse,
	updateProgress,
} from "../controllers/courseController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", getCourses);
router.get("/slug/:slug", getCourseBySlug);

// Protected user routes
router.post("/enroll", authenticate, enrollUser);
router.put("/progress/:id", authenticate, updateProgress);
router.get("/certificates", authenticate, getUserCertificates);

// Admin routes
router.post(
	"/",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	createCourse,
);
router.put(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	updateCourse,
);
router.delete("/:id", authenticate, authorize("admin"), deleteCourse);
router.get(
	"/:courseId/enrollments",
	authenticate,
	authorize("admin", "editor"),
	getCourseEnrollments,
);

export default router;
