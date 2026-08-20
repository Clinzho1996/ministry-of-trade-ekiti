"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/enrollmentRoutes.ts
const express_1 = require("express");
const enrollmentController_1 = require("../controllers/enrollmentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/user", auth_1.authenticate, enrollmentController_1.getUserEnrollments);
// Admin routes
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.getAllEnrollments);
router.get("/stats", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.getEnrollmentStats);
// Get user's own enrollments
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.getEnrollmentById);
router.put("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.updateEnrollmentStatus);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), enrollmentController_1.deleteEnrollment);
exports.default = router;
//# sourceMappingURL=enrollmentRoutes.js.map