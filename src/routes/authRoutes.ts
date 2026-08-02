// src/routes/authRoutes.ts
import { Router } from "express";
import { body } from "express-validator";
import { getCurrentUser, login, register } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

// Validation rules
const registerValidation = [
	body("firstName").trim().notEmpty().withMessage("First name is required"),
	body("lastName").trim().notEmpty().withMessage("Last name is required"),
	body("email").isEmail().withMessage("Please provide a valid email"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("phone").optional().trim(),
];

const loginValidation = [
	body("email").isEmail().withMessage("Please provide a valid email"),
	body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", authenticate, getCurrentUser);

export default router;
