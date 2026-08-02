// src/controllers/userController.ts
import bcrypt from "bcryptjs";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import User from "../models/User";
import logger from "../utils/logger";

export const getUsers = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { limit, page, search, role } = req.query;

		const query: any = {};
		if (role) {
			query.role = role;
		}
		if (search) {
			query.$or = [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		const pageNum = parseInt(page as string) || 1;
		const limitNum = parseInt(limit as string) || 10;
		const skip = (pageNum - 1) * limitNum;

		const [users, total] = await Promise.all([
			User.find(query)
				.select("-password")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limitNum),
			User.countDocuments(query),
		]);

		res.status(200).json({
			success: true,
			count: users.length,
			total,
			page: pageNum,
			totalPages: Math.ceil(total / limitNum),
			data: users,
		});
	} catch (error) {
		logger.error("Get users error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch users.",
		});
	}
};

export const getUserById = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const user = await User.findById(req.params.id).select("-password");
		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		logger.error("Get user by id error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch user.",
		});
	}
};

export const createUser = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { firstName, lastName, email, password, phone, role } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			res.status(400).json({
				success: false,
				message: "User already exists with this email.",
			});
			return;
		}

		const user = await User.create({
			firstName,
			lastName,
			email,
			password,
			phone,
			role: role || "user",
			isActive: true,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "USER",
			resourceId: user._id.toString(),
			details: { email: user.email, role: user.role },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "User created successfully.",
			data: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				role: user.role,
				isActive: user.isActive,
			},
		});
	} catch (error) {
		logger.error("Create user error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create user.",
		});
	}
};

export const updateUser = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found.",
			});
			return;
		}

		const { firstName, lastName, email, phone, role, isActive, password } =
			req.body;

		// Check if email is being changed and is unique
		if (email && email !== user.email) {
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				res.status(400).json({
					success: false,
					message: "Email already in use.",
				});
				return;
			}
			user.email = email;
		}

		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (phone) user.phone = phone;
		if (role) user.role = role;
		if (isActive !== undefined)
			user.isActive = isActive === "true" || isActive === true;

		// Update password if provided
		if (password) {
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
		}

		await user.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "USER",
			resourceId: user._id.toString(),
			details: { email: user.email, role: user.role },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "User updated successfully.",
			data: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				role: user.role,
				isActive: user.isActive,
			},
		});
	} catch (error) {
		logger.error("Update user error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update user.",
		});
	}
};

export const deleteUser = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found.",
			});
			return;
		}

		// Prevent deleting yourself
		if (user._id.toString() === req.userId) {
			res.status(400).json({
				success: false,
				message: "You cannot delete your own account.",
			});
			return;
		}

		await user.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "USER",
			resourceId: req.params.id,
			details: { email: user.email },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "User deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete user error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete user.",
		});
	}
};

export const toggleUserStatus = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			res.status(404).json({
				success: false,
				message: "User not found.",
			});
			return;
		}

		// Prevent deactivating yourself
		if (user._id.toString() === req.userId) {
			res.status(400).json({
				success: false,
				message: "You cannot deactivate your own account.",
			});
			return;
		}

		user.isActive = !user.isActive;
		await user.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "USER",
			resourceId: user._id.toString(),
			details: { email: user.email, isActive: user.isActive },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
			data: {
				id: user._id,
				email: user.email,
				isActive: user.isActive,
			},
		});
	} catch (error) {
		logger.error("Toggle user status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update user status.",
		});
	}
};
