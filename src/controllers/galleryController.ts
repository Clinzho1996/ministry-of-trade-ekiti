// src/controllers/galleryController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Gallery from "../models/Gallery";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../utils/cloudinaryUpload";
import logger from "../utils/logger";

export const getGalleryItems = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { category, limit, isPublished } = req.query;

		const query: any = {};
		if (category) {
			query.category = category;
		}
		if (isPublished !== undefined) {
			query.isPublished = isPublished === "true";
		}

		const items = await Gallery.find(query)
			.sort({ date: -1, createdAt: -1 })
			.limit(limit ? parseInt(limit as string) : 0);

		res.status(200).json({
			success: true,
			count: items.length,
			data: items,
		});
	} catch (error) {
		logger.error("Get gallery items error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch gallery items.",
		});
	}
};

export const createGalleryItem = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { title, category, date, description } = req.body;

		// Validate required fields
		if (!title || !category || !date) {
			res.status(400).json({
				success: false,
				message: "Please provide title, category, and date.",
			});
			return;
		}

		// Upload image
		let imageUrl = "";
		let imagePublicId = "";
		if (req.file) {
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"gallery",
				`gallery_${Date.now()}`,
			);
			imageUrl = uploadResult.secure_url;
			imagePublicId = uploadResult.public_id;
		} else {
			res.status(400).json({
				success: false,
				message: "Image is required.",
			});
			return;
		}

		const galleryItem = await Gallery.create({
			title,
			category,
			date: new Date(date),
			description,
			image: imageUrl,
			imagePublicId,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "GALLERY",
			resourceId: galleryItem._id.toString(),
			details: { title: galleryItem.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Gallery item created successfully.",
			data: galleryItem,
		});
	} catch (error) {
		logger.error("Create gallery item error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create gallery item.",
		});
	}
};

export const deleteGalleryItem = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const item = await Gallery.findById(req.params.id);
		if (!item) {
			res.status(404).json({
				success: false,
				message: "Gallery item not found.",
			});
			return;
		}

		// Delete image from Cloudinary
		if (item.imagePublicId) {
			await deleteFromCloudinary(item.imagePublicId);
		}

		await item.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "GALLERY",
			resourceId: req.params.id,
			details: { title: item.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Gallery item deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete gallery item error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete gallery item.",
		});
	}
};
