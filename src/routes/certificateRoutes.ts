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
router.get("/:id", authenticate, getCertificateById); // Users can view their own certificates
router.get("/:id/download", authenticate, downloadCertificate); // Users can download their own certificates

// Admin routes
router.get("/", authenticate, authorize("admin", "editor"), getAllCertificates);
router.post(
	"/generate",
	authenticate,
	authorize("admin", "editor"),
	generateCertificate,
);
router.put("/:id/revoke", authenticate, authorize("admin"), revokeCertificate);

export default router;
