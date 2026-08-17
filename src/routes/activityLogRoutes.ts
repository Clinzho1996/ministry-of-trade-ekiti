// src/routes/activityLogRoutes.ts
import { Router } from "express";
import {
	getActivityLogById,
	getActivityLogs,
	getActivityStats,
} from "../controllers/activityLogController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getActivityLogs);
router.get("/stats", getActivityStats);
router.get("/:id", getActivityLogById);

export default router;
