// src/routes/businessRoutes.ts
import { Router } from "express";
import {
	approveRegistration,
	createBusiness,
	deleteBusiness,
	deleteBusinessImage,
	getBusiness,
	getBusinessByCertificateId,
	getBusinessBySlug,
	getBusinessCategories,
	getBusinessCertificate,
	getBusinesses,
	getPendingRegistrations,
	getRegistrationsByStatus,
	issueCertificate,
	rejectRegistration,
	submitRegistration,
	updateBusiness,
	uploadBusinessImages,
} from "../controllers/businessController";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", getBusinesses);
router.get("/categories", getBusinessCategories);
router.get("/slug/:slug", getBusinessBySlug);
router.get("/:id", getBusiness);

// Certificate routes - must come BEFORE /:id
router.get("/certificate/:certificateId", getBusinessByCertificateId);
router.get("/:id/certificate", authenticate, getBusinessCertificate);

// Public registration submission - no auth required
router.post("/register", upload.single("logo"), submitRegistration);

// Admin routes - Registration Management
router.get(
	"/registrations/pending",
	authenticate,
	authorize("admin", "editor"),
	getPendingRegistrations,
);
router.get(
	"/registrations/:status",
	authenticate,
	authorize("admin", "editor"),
	getRegistrationsByStatus,
);
router.put(
	"/registrations/:id/approve",
	authenticate,
	authorize("admin", "editor"),
	approveRegistration,
);
router.put(
	"/registrations/:id/reject",
	authenticate,
	authorize("admin", "editor"),
	rejectRegistration,
);
router.put(
	"/registrations/:id/certificate",
	authenticate,
	authorize("admin", "editor"),
	issueCertificate,
);

// Admin routes - Business Management
router.post(
	"/",
	authenticate,
	authorize("admin", "editor"),
	upload.single("logo"),
	createBusiness,
);
router.put(
	"/:id",
	authenticate,
	authorize("admin", "editor"),
	upload.single("logo"),
	updateBusiness,
);
router.post(
	"/:id/images",
	authenticate,
	authorize("admin", "editor"),
	upload.array("images", 10),
	uploadBusinessImages,
);
router.delete(
	"/:id/images",
	authenticate,
	authorize("admin", "editor"),
	deleteBusinessImage,
);
router.delete("/:id", authenticate, authorize("admin"), deleteBusiness);

export default router;
