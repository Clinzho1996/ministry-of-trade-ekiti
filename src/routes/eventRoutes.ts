// src/routes/eventRoutes.ts
import { Router } from "express";
import {
	createEvent,
	deleteEvent,
	getEventBySlug,
	getEvents,
	updateEvent,
} from "../controllers/eventController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", getEvents);
router.get("/slug/:slug", getEventBySlug);
router.get("/:id", getEvents); // Fallback by ID

// Admin routes
router.post(
	"/",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	createEvent,
);
router.put(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	upload.single("image"),
	updateEvent,
);
router.delete("/:id", authenticate, authorize("admin"), deleteEvent);

export default router;
