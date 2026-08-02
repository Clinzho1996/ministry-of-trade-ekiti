// src/controllers/eventController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Event from "../models/Event";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../utils/cloudinaryUpload";
import logger from "../utils/logger";

export const getEvents = async (req: Request, res: Response): Promise<void> => {
	try {
		const { limit, featured, isPublished, isPast, category } = req.query;

		const query: any = {};
		if (isPublished !== undefined) {
			query.isPublished = isPublished === "true";
		}
		if (featured !== undefined) {
			query.featured = featured === "true";
		}
		if (isPast !== undefined) {
			query.isPast = isPast === "true";
		}
		if (category) {
			query.category = category;
		}

		const events = await Event.find(query)
			.sort({ date: 1, createdAt: -1 })
			.limit(limit ? parseInt(limit as string) : 0);

		res.status(200).json({
			success: true,
			count: events.length,
			data: events,
		});
	} catch (error) {
		logger.error("Get events error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch events.",
		});
	}
};

export const getEventBySlug = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const event = await Event.findOne({ slug: req.params.slug });
		if (!event) {
			res.status(404).json({
				success: false,
				message: "Event not found.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: event,
		});
	} catch (error) {
		logger.error("Get event by slug error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch event.",
		});
	}
};

export const createEvent = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const {
			category,
			date,
			location,
			title,
			description,
			content,
			isPublished,
			featured,
			capacity,
		} = req.body;

		// Upload image if provided
		let imageUrl = "";
		let imagePublicId = "";
		if (req.file) {
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"events",
				`event_${Date.now()}`,
			);
			imageUrl = uploadResult.secure_url;
			imagePublicId = uploadResult.public_id;
		}

		// Generate slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		const event = await Event.create({
			category,
			date: new Date(date),
			location,
			title,
			description,
			content,
			image: imageUrl || "/images/placeholder.png",
			imagePublicId: imagePublicId || "",
			slug,
			isPublished: isPublished !== undefined ? isPublished : true,
			featured: featured || false,
			capacity: capacity ? parseInt(capacity) : undefined,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "EVENT",
			resourceId: event._id.toString(),
			details: { title: event.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Event created successfully.",
			data: event,
		});
	} catch (error) {
		logger.error("Create event error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create event.",
		});
	}
};

export const updateEvent = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) {
			res.status(404).json({
				success: false,
				message: "Event not found.",
			});
			return;
		}

		const {
			category,
			date,
			location,
			title,
			description,
			content,
			isPublished,
			featured,
			capacity,
			isPast,
		} = req.body;

		// Upload new image if provided and delete old one
		if (req.file) {
			if (event.imagePublicId) {
				await deleteFromCloudinary(event.imagePublicId);
			}
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"events",
				`event_${Date.now()}`,
			);
			event.image = uploadResult.secure_url;
			event.imagePublicId = uploadResult.public_id;
		}

		// Update fields
		if (category) event.category = category;
		if (date) event.date = new Date(date);
		if (location) event.location = location;
		if (title) {
			event.title = title;
			// Update slug if title changes
			event.slug = title
				.toLowerCase()
				.replace(/[^a-zA-Z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
		}
		if (description) event.description = description;
		if (content) event.content = content;
		if (isPublished !== undefined) event.isPublished = isPublished;
		if (featured !== undefined) event.featured = featured;
		if (capacity !== undefined)
			event.capacity = capacity ? parseInt(capacity) : undefined;
		if (isPast !== undefined) event.isPast = isPast;

		await event.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "EVENT",
			resourceId: event._id.toString(),
			details: { title: event.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Event updated successfully.",
			data: event,
		});
	} catch (error) {
		logger.error("Update event error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update event.",
		});
	}
};

export const deleteEvent = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) {
			res.status(404).json({
				success: false,
				message: "Event not found.",
			});
			return;
		}

		// Delete image from Cloudinary
		if (event.imagePublicId) {
			await deleteFromCloudinary(event.imagePublicId);
		}

		await event.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "EVENT",
			resourceId: req.params.id,
			details: { title: event.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Event deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete event error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete event.",
		});
	}
};
