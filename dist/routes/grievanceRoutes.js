"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/grievanceRoutes.ts
const express_1 = require("express");
const grievanceController_1 = require("../controllers/grievanceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post("/", grievanceController_1.submitGrievance);
router.get("/track/:trackingId", grievanceController_1.trackGrievance);
// Admin routes
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), grievanceController_1.getAllGrievances);
router.get("/stats", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), grievanceController_1.getGrievanceStats);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), grievanceController_1.getGrievanceById);
router.put("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), grievanceController_1.updateGrievanceStatus);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), grievanceController_1.deleteGrievance);
exports.default = router;
//# sourceMappingURL=grievanceRoutes.js.map