// src/controllers/uploadController.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import logger from "../utils/logger";

export const uploadImage = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		if (!req.file) {
			res.status(400).json({
				success: false,
				message: "No image file provided.",
			});
			return;
		}

		const uploadResult = await uploadToCloudinary(
			req.file.buffer,
			"uploads",
			`upload_${Date.now()}`,
		);

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "UPLOAD",
			details: { publicId: uploadResult.public_id },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Image uploaded successfully.",
			data: {
				url: uploadResult.secure_url,
				publicId: uploadResult.public_id,
			},
		});
	} catch (error) {
		logger.error("Upload image error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to upload image.",
		});
	}
};

export const deleteImage = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { publicId } = req.body;

		if (!publicId) {
			res.status(400).json({
				success: false,
				message: "Public ID is required.",
			});
			return;
		}

		const { deleteFromCloudinary } = await import("../utils/cloudinaryUpload");
		await deleteFromCloudinary(publicId);

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "UPLOAD",
			details: { publicId },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Image deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete image error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete image.",
		});
	}
};
