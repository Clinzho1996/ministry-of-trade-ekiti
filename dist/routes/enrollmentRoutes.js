"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/enrollmentRoutes.ts
const express_1 = require("express");
const enrollmentController_1 = require("../controllers/enrollmentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes - accessible to authenticated users
router.get("/user", auth_1.authenticate, enrollmentController_1.getUserEnrollments);
router.put("/:id/progress", auth_1.authenticate, enrollmentController_1.updateEnrollmentStatus); // Users can update their own progress
// Admin routes
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.getAllEnrollments);
router.get("/stats", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.getEnrollmentStats);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.getEnrollmentById);
router.put("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), enrollmentController_1.updateEnrollmentStatus);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), enrollmentController_1.deleteEnrollment);
exports.default = router;
//# sourceMappingURL=enrollmentRoutes.js.map