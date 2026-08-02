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
		const { limit, featured, isPublished, category, search } = req.query;

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
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
			];
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

export const getNewsById = async (
	req: Request,
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

		res.status(200).json({
			success: true,
			data: news,
		});
	} catch (error) {
		logger.error("Get news by id error:", error);
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

		// Validate required fields
		if (!title || !category || !description || !content) {
			res.status(400).json({
				success: false,
				message:
					"Please provide all required fields: title, category, description, content.",
			});
			return;
		}

		// Upload image if provided
		let imageUrl = "/images/placeholder.png";
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

		// Check if slug already exists
		const existingNews = await News.findOne({ slug });
		if (existingNews) {
			res.status(400).json({
				success: false,
				message: "A news article with this title already exists.",
			});
			return;
		}

		const news = await News.create({
			category,
			date: date || new Date(),
			title,
			description,
			content,
			image: imageUrl,
			imagePublicId: imagePublicId,
			slug,
			isPublished: isPublished === "true" || isPublished === true,
			featured: featured === "true" || featured === true,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "NEWS",
			resourceId: news._id.toString(),
			details: { title: news.title, slug: news.slug },
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
				try {
					await deleteFromCloudinary(news.imagePublicId);
				} catch (error) {
					logger.warn("Failed to delete old image:", error);
				}
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
			const newSlug = title
				.toLowerCase()
				.replace(/[^a-zA-Z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");

			// Check if new slug conflicts with another article
			if (newSlug !== news.slug) {
				const existingNews = await News.findOne({
					slug: newSlug,
					_id: { $ne: news._id },
				});
				if (existingNews) {
					res.status(400).json({
						success: false,
						message: "Another news article with this title already exists.",
					});
					return;
				}
				news.slug = newSlug;
			}
		}
		if (description) news.description = description;
		if (content) news.content = content;
		if (isPublished !== undefined)
			news.isPublished = isPublished === "true" || isPublished === true;
		if (featured !== undefined)
			news.featured = featured === "true" || featured === true;

		await news.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "NEWS",
			resourceId: news._id.toString(),
			details: { title: news.title, slug: news.slug },
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
			try {
				await deleteFromCloudinary(news.imagePublicId);
			} catch (error) {
				logger.warn("Failed to delete image from Cloudinary:", error);
			}
		}

		await news.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "NEWS",
			resourceId: req.params.id,
			details: { title: news.title, slug: news.slug },
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
