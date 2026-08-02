// src/controllers/authController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import ActivityLog from "../models/ActivityLog";
import User from "../models/User";
import logger from "../utils/logger";

export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { firstName, lastName, email, password, phone } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({
				success: false,
				message: "User already exists with this email.",
			});
			return;
		}

		// Create user
		const user = await User.create({
			firstName,
			lastName,
			email,
			password,
			phone,
			role: "user",
		});

		// Log activity
		await ActivityLog.create({
			userId: user._id.toString(),
			userEmail: user.email,
			action: "REGISTER",
			resource: "USER",
			resourceId: user._id.toString(),
			details: { email: user.email },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "User registered successfully.",
			data: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		logger.error("Registration error:", error);
		res.status(500).json({
			success: false,
			message: "Registration failed. Please try again.",
		});
	}
};

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;

		// Find user
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			res.status(401).json({
				success: false,
				message: "Invalid credentials.",
			});
			return;
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			res.status(401).json({
				success: false,
				message: "Invalid credentials.",
			});
			return;
		}

		// Check if user is active
		if (!user.isActive) {
			res.status(403).json({
				success: false,
				message: "Account is deactivated. Please contact admin.",
			});
			return;
		}

		// Update last login
		user.lastLogin = new Date();
		await user.save();

		// Generate token
		const token = jwt.sign(
			{ id: user._id, email: user.email, role: user.role },
			process.env.JWT_SECRET as unknown as jwt.Secret,
			{ expiresIn: process.env.JWT_EXPIRE || "7d" } as jwt.SignOptions,
		);

		// Log activity
		await ActivityLog.create({
			userId: user._id.toString(),
			userEmail: user.email,
			action: "LOGIN",
			resource: "USER",
			resourceId: user._id.toString(),
			details: { email: user.email },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Login successful.",
			data: {
				token,
				user: {
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					phone: user.phone,
					role: user.role,
				},
			},
		});
	} catch (error) {
		logger.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Login failed. Please try again.",
		});
	}
};

export const getCurrentUser = async (
	req: any,
	res: Response,
): Promise<void> => {
	try {
		const user = await User.findById(req.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				role: user.role,
				isActive: user.isActive,
				lastLogin: user.lastLogin,
			},
		});
	} catch (error) {
		logger.error("Get current user error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch user data.",
		});
	}
};
