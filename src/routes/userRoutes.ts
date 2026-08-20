// src/routes/userRoutes.ts
import { Router } from "express";
import {
	createUser,
	deleteUser,
	getCurrentUserProfile,
	getUserById,
	getUsers,
	toggleUserStatus,
	updateUser,
} from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public user routes - accessible to authenticated users
router.get("/me", authenticate, getCurrentUserProfile);
router.put("/me", authenticate, updateUser); // Users can update their own profile

// Admin only routes
router.get("/", authenticate, authorize("admin"), getUsers);
router.get("/:id", authenticate, authorize("admin"), getUserById);
router.post("/", authenticate, authorize("admin"), createUser);
router.put("/:id", authenticate, authorize("admin"), updateUser); // Admin can update any user
router.delete("/:id", authenticate, authorize("admin"), deleteUser);
router.patch(
	"/:id/toggle-status",
	authenticate,
	authorize("admin"),
	toggleUserStatus,
);

export default router;
