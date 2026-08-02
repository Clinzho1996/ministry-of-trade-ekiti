// src/controllers/newsController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import News from "../models/News";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../utils/cloudinaryUpload";
import logger from "../utils/logger";

export const getNews = async (req: Request, res: Response): Promise<void> => {
	try {
		const { limit, featured, isPublished, category } = req.query;

		const query: any = {};
		if (isPublished !== undefined) {
			query.isPublished = isPublished === "true";
		}
		if (featured !== undefined) {
			query.featured = featured === "true";
		}
		if (category) {
			query.category = category;
		}

		const news = await News.find(query)
			.sort({ date: -1, createdAt: -1 })
			.limit(limit ? parseInt(limit as string) : 0);

		res.status(200).json({
			success: true,
			count: news.length,
			data: news,
		});
	} catch (error) {
		logger.error("Get news error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch news.",
		});
	}
};

export const getNewsBySlug = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const news = await News.findOne({ slug: req.params.slug });
		if (!news) {
			res.status(404).json({
				success: false,
				message: "News not found.",
			});
			return;
		}

		// Increment views
		news.views += 1;
		await news.save();

		res.status(200).json({
			success: true,
			data: news,
		});
	} catch (error) {
		logger.error("Get news by slug error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch news.",
		});
	}
};

export const createNews = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const {
			category,
			date,
			title,
			description,
			content,
			isPublished,
			featured,
		} = req.body;

		// Upload image if provided
		let imageUrl = "";
		let imagePublicId = "";
		if (req.file) {
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"news",
				`news_${Date.now()}`,
			);
			imageUrl = uploadResult.secure_url;
			imagePublicId = uploadResult.public_id;
		}

		// Generate slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		const news = await News.create({
			category,
			date: date || new Date(),
			title,
			description,
			content,
			image: imageUrl || "/images/placeholder.png",
			imagePublicId: imagePublicId || "",
			slug,
			isPublished: isPublished !== undefined ? isPublished : true,
			featured: featured || false,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "NEWS",
			resourceId: news._id.toString(),
			details: { title: news.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "News created successfully.",
			data: news,
		});
	} catch (error) {
		logger.error("Create news error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create news.",
		});
	}
};

export const updateNews = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const news = await News.findById(req.params.id);
		if (!news) {
			res.status(404).json({
				success: false,
				message: "News not found.",
			});
			return;
		}

		const {
			category,
			date,
			title,
			description,
			content,
			isPublished,
			featured,
		} = req.body;

		// Upload new image if provided and delete old one
		if (req.file) {
			if (news.imagePublicId) {
				await deleteFromCloudinary(news.imagePublicId);
			}
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"news",
				`news_${Date.now()}`,
			);
			news.image = uploadResult.secure_url;
			news.imagePublicId = uploadResult.public_id;
		}

		// Update fields
		if (category) news.category = category;
		if (date) news.date = new Date(date);
		if (title) {
			news.title = title;
			// Update slug if title changes
			news.slug = title
				.toLowerCase()
				.replace(/[^a-zA-Z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
		}
		if (description) news.description = description;
		if (content) news.content = content;
		if (isPublished !== undefined) news.isPublished = isPublished;
		if (featured !== undefined) news.featured = featured;

		await news.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "NEWS",
			resourceId: news._id.toString(),
			details: { title: news.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "News updated successfully.",
			data: news,
		});
	} catch (error) {
		logger.error("Update news error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update news.",
		});
	}
};

export const deleteNews = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const news = await News.findById(req.params.id);
		if (!news) {
			res.status(404).json({
				success: false,
				message: "News not found.",
			});
			return;
		}

		// Delete image from Cloudinary
		if (news.imagePublicId) {
			await deleteFromCloudinary(news.imagePublicId);
		}

		await news.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "NEWS",
			resourceId: req.params.id,
			details: { title: news.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "News deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete news error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete news.",
		});
	}
};
