// src/routes/certificateRoutes.ts
import { Router } from "express";
import {
	downloadCertificate,
	generateCertificate,
	getAllCertificates,
	getCertificateById,
	getUserCertificates,
	revokeCertificate,
} from "../controllers/certificateController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// User routes - accessible to authenticated users (must be BEFORE /:id)
router.get("/user", authenticate, getUserCertificates);

// Admin routes
router.get("/", authenticate, authorize("admin", "editor"), getAllCertificates);
router.get(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	getCertificateById,
);
router.post(
	"/generate",
	authenticate,
	authorize("admin", "editor"),
	generateCertificate,
);
router.put("/:id/revoke", authenticate, authorize("admin"), revokeCertificate);
router.get(
	"/:id/download",
	authenticate,
	authorize("admin", "editor"),
	downloadCertificate,
);

export default router;
