// src/routes/contactRoutes.ts
import { Router } from "express";
import {
	deleteContact,
	getContact,
	getContacts,
	submitContact,
	updateContactStatus,
} from "../controllers/contactController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public route - submit contact form
router.post("/", submitContact);

// Admin routes
router.get("/", authenticate, authorize("admin", "editor"), getContacts);
router.get("/:id", authenticate, authorize("admin", "editor"), getContact);
router.put(
	"/:id/status",
	authenticate,
	authorize("admin", "editor"),
	updateContactStatus,
);
router.delete("/:id", authenticate, authorize("admin"), deleteContact);

export default router;
