// src/routes/statsRoutes.ts
import { Router } from "express";
import { getDashboardStats } from "../controllers/statsController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get(
	"/dashboard",
	authenticate,
	authorize("admin", "editor"),
	getDashboardStats,
);

export default router;
