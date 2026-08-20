// src/routes/certificateRoutes.ts
import { Router } from "express";
import {
	downloadCertificate,
	generateCertificate,
	getAllCertificates,
	getCertificateById,
	revokeCertificate,
} from "../controllers/certificateController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

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
