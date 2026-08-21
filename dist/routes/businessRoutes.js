"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/businessRoutes.ts
const express_1 = require("express");
const businessController_1 = require("../controllers/businessController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", businessController_1.getBusinesses);
router.get("/categories", businessController_1.getBusinessCategories);
router.get("/slug/:slug", businessController_1.getBusinessBySlug);
router.get("/:id", businessController_1.getBusiness);
// Certificate routes - must come BEFORE /:id
router.get("/certificate/:certificateId", businessController_1.getBusinessByCertificateId);
router.get("/:id/certificate", auth_1.authenticate, businessController_1.getBusinessCertificate);
// Public registration submission - no auth required
router.post("/register", upload_1.upload.single("logo"), businessController_1.submitRegistration);
// Admin routes - Registration Management
router.get("/registrations/pending", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), businessController_1.getPendingRegistrations);
router.get("/registrations/:status", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), businessController_1.getRegistrationsByStatus);
router.put("/registrations/:id/approve", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), businessController_1.approveRegistration);
router.put("/registrations/:id/reject", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), businessController_1.rejectRegistration);
router.put("/registrations/:id/certificate", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), businessController_1.issueCertificate);
// Admin routes - Business Management
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("logo"), businessController_1.createBusiness);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("logo"), businessController_1.updateBusiness);
router.post("/:id/images", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.array("images", 10), businessController_1.uploadBusinessImages);
router.delete("/:id/images", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), businessController_1.deleteBusinessImage);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), businessController_1.deleteBusiness);
exports.default = router;
//# sourceMappingURL=businessRoutes.js.map