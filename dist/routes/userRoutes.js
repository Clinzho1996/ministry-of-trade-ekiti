"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public user routes - accessible to authenticated users
router.get("/me", auth_1.authenticate, userController_1.getCurrentUserProfile);
router.put("/me", auth_1.authenticate, userController_1.updateUser); // Users can update their own profile
// Admin only routes
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), userController_1.getUsers);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), userController_1.getUserById);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("admin"), userController_1.createUser);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), userController_1.updateUser); // Admin can update any user
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("admin"), userController_1.deleteUser);
router.patch("/:id/toggle-status", auth_1.authenticate, (0, auth_1.authorize)("admin"), userController_1.toggleUserStatus);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map