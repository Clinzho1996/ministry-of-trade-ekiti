"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/courseRoutes.ts
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", courseController_1.getCourses);
router.get("/slug/:slug", courseController_1.getCourseBySlug);
// Protected user routes
router.post("/enroll", auth_1.authenticate, courseController_1.enrollUser);
router.put("/progress/:id", auth_1.authenticate, courseController_1.updateProgress);
router.get("/certificates", auth_1.authenticate, courseController_1.getUserCertificates);
// Admin routes
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("image"), courseController_1.createCourse);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), upload_1.upload.single("image"), courseController_1.updateCourse);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), courseController_1.deleteCourse);
router.get("/:courseId/enrollments", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), courseController_1.getCourseEnrollments);
exports.default = router;
//# sourceMappingURL=courseRoutes.js.map