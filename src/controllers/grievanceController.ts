// src/controllers/grievanceController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Grievance from "../models/Grievance";
import logger from "../utils/logger";

// Generate unique tracking ID
const generateTrackingId = (): string => {
	const year = new Date().getFullYear();
	const random = Math.random().toString(36).substring(2, 7).toUpperCase();
	const count = Math.floor(Math.random() * 1000)
		.toString()
		.padStart(3, "0");
	return `GRV-${year}-${count}-${random}`;
};

// Submit a new grievance
export const submitGrievance = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const {
			firstName,
			lastName,
			email,
			phone,
			grievanceType,
			priority,
			incidentDate,
			description,
			expectedResolution,
		} = req.body;

		// Validate required fields
		if (!firstName || !lastName || !email || !grievanceType || !description) {
			res.status(400).json({
				success: false,
				message:
					"Please provide all required fields: firstName, lastName, email, grievanceType, description.",
			});
			return;
		}

		// Generate unique tracking ID
		const trackingId = generateTrackingId();

		const grievance = await Grievance.create({
			trackingId,
			firstName,
			lastName,
			email,
			phone,
			grievanceType,
			priority: priority || "medium",
			incidentDate: incidentDate ? new Date(incidentDate) : undefined,
			description,
			expectedResolution,
			status: "pending",
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "GRIEVANCE",
			resourceId: grievance._id.toString(),
			details: {
				trackingId: grievance.trackingId,
				type: grievance.grievanceType,
			},
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Grievance submitted successfully.",
			data: {
				trackingId: grievance.trackingId,
				status: grievance.status,
				createdAt: grievance.get("createdAt"),
			},
		});
	} catch (error) {
		logger.error("Submit grievance error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to submit grievance. Please try again.",
		});
	}
};

// Track grievance by tracking ID
export const trackGrievance = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { trackingId } = req.params;

		if (!trackingId) {
			res.status(400).json({
				success: false,
				message: "Tracking ID is required.",
			});
			return;
		}

		const grievance = await Grievance.findOne({ trackingId });
		if (!grievance) {
			res.status(404).json({
				success: false,
				message: "Grievance not found with this tracking ID.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				trackingId: grievance.trackingId,
				firstName: grievance.firstName,
				lastName: grievance.lastName,
				email: grievance.email,
				grievanceType: grievance.grievanceType,
				priority: grievance.priority,
				status: grievance.status,
				description: grievance.description,
				expectedResolution: grievance.expectedResolution,
				resolution: grievance.resolution,
				createdAt: grievance.get("createdAt"),
				updatedAt: grievance.get("updatedAt"),
			},
		});
	} catch (error) {
		logger.error("Track grievance error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to track grievance.",
		});
	}
};

// Get all grievances (Admin)
export const getAllGrievances = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { limit, page, status, search, grievanceType } = req.query;

		const query: any = {};
		if (status) query.status = status;
		if (grievanceType) query.grievanceType = grievanceType;
		if (search) {
			query.$or = [
				{ trackingId: { $regex: search, $options: "i" } },
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		const pageNum = parseInt(page as string) || 1;
		const limitNum = parseInt(limit as string) || 20;
		const skip = (pageNum - 1) * limitNum;

		const [grievances, total] = await Promise.all([
			Grievance.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
			Grievance.countDocuments(query),
		]);

		res.status(200).json({
			success: true,
			count: grievances.length,
			total,
			page: pageNum,
			totalPages: Math.ceil(total / limitNum),
			data: grievances,
		});
	} catch (error) {
		logger.error("Get all grievances error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch grievances.",
		});
	}
};

// Get grievance by ID (Admin)
export const getGrievanceById = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const grievance = await Grievance.findById(req.params.id);
		if (!grievance) {
			res.status(404).json({
				success: false,
				message: "Grievance not found.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: grievance,
		});
	} catch (error) {
		logger.error("Get grievance by id error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch grievance.",
		});
	}
};

// Update grievance status (Admin)
export const updateGrievanceStatus = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { status, resolution } = req.body;

		if (!status) {
			res.status(400).json({
				success: false,
				message: "Status is required.",
			});
			return;
		}

		const validStatuses = ["pending", "in-review", "resolved", "rejected"];
		if (!validStatuses.includes(status)) {
			res.status(400).json({
				success: false,
				message:
					"Invalid status. Must be pending, in-review, resolved, or rejected.",
			});
			return;
		}

		const grievance = await Grievance.findById(id);
		if (!grievance) {
			res.status(404).json({
				success: false,
				message: "Grievance not found.",
			});
			return;
		}

		// Check if status is changing to resolved or rejected, require resolution
		if ((status === "resolved" || status === "rejected") && !resolution) {
			res.status(400).json({
				success: false,
				message:
					"Resolution details are required when resolving or rejecting a grievance.",
			});
			return;
		}

		grievance.status = status;
		if (resolution) {
			grievance.resolution = resolution;
		}
		if (status === "resolved" || status === "rejected") {
			grievance.resolvedBy = req.user?.email || req.userId;
			grievance.resolvedAt = new Date();
		}

		await grievance.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "GRIEVANCE",
			resourceId: grievance._id.toString(),
			details: { trackingId: grievance.trackingId, status },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: `Grievance status updated to ${status}.`,
			data: grievance,
		});
	} catch (error) {
		logger.error("Update grievance status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update grievance status.",
		});
	}
};

// Delete grievance (Admin)
export const deleteGrievance = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const grievance = await Grievance.findById(req.params.id);
		if (!grievance) {
			res.status(404).json({
				success: false,
				message: "Grievance not found.",
			});
			return;
		}

		await grievance.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "GRIEVANCE",
			resourceId: req.params.id,
			details: { trackingId: grievance.trackingId },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Grievance deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete grievance error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete grievance.",
		});
	}
};

// Get grievance statistics (Admin)
export const getGrievanceStats = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const [total, pending, inReview, resolved, rejected] = await Promise.all([
			Grievance.countDocuments(),
			Grievance.countDocuments({ status: "pending" }),
			Grievance.countDocuments({ status: "in-review" }),
			Grievance.countDocuments({ status: "resolved" }),
			Grievance.countDocuments({ status: "rejected" }),
		]);

		// Get grievances by type
		const byType = await Grievance.aggregate([
			{
				$group: {
					_id: "$grievanceType",
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
		]);

		// Get monthly trend (last 6 months)
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const monthlyTrend = await Grievance.aggregate([
			{
				$match: {
					createdAt: { $gte: sixMonthsAgo },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { "_id.year": 1, "_id.month": 1 },
			},
		]);

		// Calculate average resolution time
		const resolvedGrievances = await Grievance.find({
			status: "resolved",
			resolvedAt: { $exists: true },
		});

		let avgResolutionTime = 0;
		if (resolvedGrievances.length > 0) {
			const totalDays = resolvedGrievances.reduce((acc, curr) => {
				const createdAt = curr.get("createdAt") as Date | undefined;
				if (curr.resolvedAt && createdAt) {
					const diff = curr.resolvedAt.getTime() - createdAt.getTime();
					const days = diff / (1000 * 60 * 60 * 24);
					return acc + days;
				}
				return acc;
			}, 0);
			avgResolutionTime = Math.round(totalDays / resolvedGrievances.length);
		}

		res.status(200).json({
			success: true,
			data: {
				total,
				pending,
				inReview,
				resolved,
				rejected,
				byType,
				monthlyTrend,
				avgResolutionTime,
				resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
			},
		});
	} catch (error) {
		logger.error("Get grievance stats error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch grievance statistics.",
		});
	}
};
