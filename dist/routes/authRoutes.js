"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)("firstName").trim().notEmpty().withMessage("First name is required"),
    (0, express_validator_1.body)("lastName").trim().notEmpty().withMessage("Last name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    (0, express_validator_1.body)("phone").optional().trim(),
];
const loginValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
router.post("/register", registerValidation, authController_1.register);
router.post("/login", loginValidation, authController_1.login);
router.get("/me", auth_1.authenticate, authController_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map