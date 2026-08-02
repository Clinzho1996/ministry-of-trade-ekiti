// src/routes/userRoutes.ts
import { Router } from "express";
import {
	createUser,
	deleteUser,
	getUserById,
	getUsers,
	toggleUserStatus,
	updateUser,
} from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/toggle-status", toggleUserStatus);

export default router;
