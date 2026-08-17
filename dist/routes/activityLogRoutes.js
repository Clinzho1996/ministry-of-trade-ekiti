"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/activityLogRoutes.ts
const express_1 = require("express");
const activityLogController_1 = require("../controllers/activityLogController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)("admin"));
router.get("/", activityLogController_1.getActivityLogs);
router.get("/stats", activityLogController_1.getActivityStats);
router.get("/:id", activityLogController_1.getActivityLogById);
exports.default = router;
//# sourceMappingURL=activityLogRoutes.js.map