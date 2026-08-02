// src/controllers/opportunityController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Opportunity from "../models/Opportunity";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../utils/cloudinaryUpload";
import logger from "../utils/logger";

export const getOpportunities = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { limit, sector, isActive } = req.query;

		const query: any = {};
		if (isActive !== undefined) {
			query.isActive = isActive === "true";
		}
		if (sector) {
			query.sector = sector;
		}

		const opportunities = await Opportunity.find(query)
			.sort({ sortOrder: 1, createdAt: -1 })
			.limit(limit ? parseInt(limit as string) : 0);

		res.status(200).json({
			success: true,
			count: opportunities.length,
			data: opportunities,
		});
	} catch (error) {
		logger.error("Get opportunities error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch opportunities.",
		});
	}
};

export const getOpportunity = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const opportunity = await Opportunity.findById(req.params.id);
		if (!opportunity) {
			res.status(404).json({
				success: false,
				message: "Opportunity not found.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: opportunity,
		});
	} catch (error) {
		logger.error("Get opportunity error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch opportunity.",
		});
	}
};

export const createOpportunity = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { title, description, range, link, sector, sortOrder } = req.body;

		// Upload image if provided
		let imageUrl = "";
		let imagePublicId = "";
		if (req.file) {
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"opportunities",
				`opportunity_${Date.now()}`,
			);
			imageUrl = uploadResult.secure_url;
			imagePublicId = uploadResult.public_id;
		}

		const opportunity = await Opportunity.create({
			title,
			description,
			range,
			image: imageUrl || "/images/placeholder.png",
			imagePublicId: imagePublicId || "",
			link,
			sector,
			sortOrder: sortOrder || 0,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "OPPORTUNITY",
			resourceId: opportunity._id.toString(),
			details: { title: opportunity.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Opportunity created successfully.",
			data: opportunity,
		});
	} catch (error) {
		logger.error("Create opportunity error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create opportunity.",
		});
	}
};

export const updateOpportunity = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const opportunity = await Opportunity.findById(req.params.id);
		if (!opportunity) {
			res.status(404).json({
				success: false,
				message: "Opportunity not found.",
			});
			return;
		}

		const { title, description, range, link, sector, sortOrder, isActive } =
			req.body;

		// Handle image upload
		let imageUrl = opportunity.image; // Keep existing image by default
		let imagePublicId = opportunity.imagePublicId;

		if (req.file) {
			// Delete old image from Cloudinary if it exists and is not the default
			if (opportunity.imagePublicId) {
				try {
					await deleteFromCloudinary(opportunity.imagePublicId);
				} catch (error) {
					logger.warn("Failed to delete old image:", error);
				}
			}

			// Upload new image
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"opportunities",
				`opportunity_${Date.now()}`,
			);
			imageUrl = uploadResult.secure_url;
			imagePublicId = uploadResult.public_id;
		}

		// Update fields - make sure to include the image
		opportunity.title = title || opportunity.title;
		opportunity.description = description || opportunity.description;
		opportunity.range = range || opportunity.range;
		opportunity.link = link || opportunity.link;
		opportunity.sector = sector || opportunity.sector;
		if (sortOrder !== undefined) opportunity.sortOrder = sortOrder;
		if (isActive !== undefined) opportunity.isActive = isActive;
		opportunity.image = imageUrl; // Always set the image
		opportunity.imagePublicId = imagePublicId;

		await opportunity.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "OPPORTUNITY",
			resourceId: opportunity._id.toString(),
			details: { title: opportunity.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Opportunity updated successfully.",
			data: opportunity,
		});
	} catch (error) {
		logger.error("Update opportunity error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update opportunity.",
		});
	}
};

export const deleteOpportunity = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const opportunity = await Opportunity.findById(req.params.id);
		if (!opportunity) {
			res.status(404).json({
				success: false,
				message: "Opportunity not found.",
			});
			return;
		}

		// Delete image from Cloudinary
		if (opportunity.imagePublicId) {
			await deleteFromCloudinary(opportunity.imagePublicId);
		}

		await opportunity.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "OPPORTUNITY",
			resourceId: req.params.id,
			details: { title: opportunity.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Opportunity deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete opportunity error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete opportunity.",
		});
	}
};
