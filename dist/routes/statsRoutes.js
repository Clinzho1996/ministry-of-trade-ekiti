"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/statsRoutes.ts
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/dashboard", auth_1.authenticate, (0, auth_1.authorize)("admin", "editor"), statsController_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=statsRoutes.js.map