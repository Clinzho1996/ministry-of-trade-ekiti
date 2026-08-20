"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/certificateRoutes.ts
const express_1 = require("express");
const certificateController_1 = require("../controllers/certificateController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes - accessible to authenticated users (must be BEFORE /:id)
router.get("/user", auth_1.authenticate, certificateController_1.getUserCertificates);
router.get("/:id", auth_1.authenticate, certificateController_1.getCertificateById); // Users can view their own certificates
router.get("/:id/download", auth_1.authenticate, certificateController_1.downloadCertificate); // Users can download their own certificates
// Admin routes
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), certificateController_1.getAllCertificates);
router.post("/generate", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), certificateController_1.generateCertificate);
router.put("/:id/revoke", auth_1.authenticate, (0, auth_1.authorize)("admin"), certificateController_1.revokeCertificate);
exports.default = router;
//# sourceMappingURL=certificateRoutes.js.map