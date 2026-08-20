// src/controllers/certificateController.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Certificate from "../models/Certificate";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import logger from "../utils/logger";

export const getAllCertificates = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { limit, page, search, courseId, userId } = req.query;

		const query: any = {};
		if (courseId) query.courseId = courseId;
		if (userId) query.userId = userId;
		if (search) {
			query.$or = [
				{ userEmail: { $regex: search, $options: "i" } },
				{ userName: { $regex: search, $options: "i" } },
				{ courseTitle: { $regex: search, $options: "i" } },
				{ certificateId: { $regex: search, $options: "i" } },
			];
		}

		const pageNum = parseInt(page as string) || 1;
		const limitNum = parseInt(limit as string) || 20;
		const skip = (pageNum - 1) * limitNum;

		const [certificates, total] = await Promise.all([
			Certificate.find(query).sort({ issuedAt: -1 }).skip(skip).limit(limitNum),
			Certificate.countDocuments(query),
		]);

		res.status(200).json({
			success: true,
			count: certificates.length,
			total,
			page: pageNum,
			totalPages: Math.ceil(total / limitNum),
			data: certificates,
		});
	} catch (error) {
		logger.error("Get all certificates error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch certificates.",
		});
	}
};

// src/controllers/certificateController.ts

// Get certificate by ID - Allow users to view their own
export const getCertificateById = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const certificate = await Certificate.findById(req.params.id);
		if (!certificate) {
			res.status(404).json({
				success: false,
				message: "Certificate not found.",
			});
			return;
		}

		// Check if user owns this certificate or is admin
		const isOwner =
			certificate.userId === req.userId ||
			certificate.userEmail === req.user?.email;
		const isAdmin = req.user?.role === "admin" || req.user?.role === "editor";

		if (!isOwner && !isAdmin) {
			res.status(403).json({
				success: false,
				message: "You do not have permission to view this certificate.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: certificate,
		});
	} catch (error) {
		logger.error("Get certificate by id error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch certificate.",
		});
	}
};

// Download certificate - Allow users to download their own
export const downloadCertificate = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const certificate = await Certificate.findById(req.params.id);
		if (!certificate) {
			res.status(404).json({
				success: false,
				message: "Certificate not found.",
			});
			return;
		}

		// Check if user owns this certificate or is admin
		const isOwner =
			certificate.userId === req.userId ||
			certificate.userEmail === req.user?.email;
		const isAdmin = req.user?.role === "admin" || req.user?.role === "editor";

		if (!isOwner && !isAdmin) {
			res.status(403).json({
				success: false,
				message: "You do not have permission to download this certificate.",
			});
			return;
		}

		// In production, generate a PDF here
		// For now, return the certificate data
		res.status(200).json({
			success: true,
			data: certificate,
		});
	} catch (error) {
		logger.error("Download certificate error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to download certificate.",
		});
	}
};

// Get user certificates - Already public for authenticated users
export const getUserCertificates = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const userId = req.userId;
		const userEmail = req.user?.email;

		// Build query to find certificates by userId or userEmail
		const query = userId ? { userId } : { userEmail };

		const certificates = await Certificate.find(query).sort({ issuedAt: -1 });

		res.status(200).json({
			success: true,
			count: certificates.length,
			data: certificates,
		});
	} catch (error) {
		logger.error("Get user certificates error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch certificates.",
		});
	}
};

export const generateCertificate = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { enrollmentId } = req.body;

		const enrollment = await Enrollment.findById(enrollmentId);
		if (!enrollment) {
			res.status(404).json({
				success: false,
				message: "Enrollment not found.",
			});
			return;
		}

		if (enrollment.status !== "completed") {
			res.status(400).json({
				success: false,
				message: "Course must be completed before generating certificate.",
			});
			return;
		}

		const course = await Course.findById(enrollment.courseId);
		if (!course) {
			res.status(404).json({
				success: false,
				message: "Course not found.",
			});
			return;
		}

		// Check if certificate already exists
		const existingCertificate = await Certificate.findOne({
			userId: enrollment.userId,
			courseId: enrollment.courseId,
		});

		if (existingCertificate) {
			res.status(400).json({
				success: false,
				message: "Certificate already generated for this enrollment.",
			});
			return;
		}

		const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

		const certificate = await Certificate.create({
			userId: enrollment.userId,
			userEmail: enrollment.userEmail,
			userName: enrollment.userName || "Student",
			courseId: course._id.toString(),
			courseTitle: course.title,
			certificateId,
			completionDate: new Date(),
			certificateUrl: `/certificates/${certificateId}`,
			issued: true,
			issuedAt: new Date(),
		});

		enrollment.certificateIssued = true;
		enrollment.certificateUrl = certificate.certificateUrl;
		await enrollment.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "CERTIFICATE",
			resourceId: certificate._id.toString(),
			details: { user: certificate.userName, course: certificate.courseTitle },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Certificate generated successfully.",
			data: certificate,
		});
	} catch (error) {
		logger.error("Generate certificate error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to generate certificate.",
		});
	}
};

export const revokeCertificate = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const certificate = await Certificate.findById(req.params.id);
		if (!certificate) {
			res.status(404).json({
				success: false,
				message: "Certificate not found.",
			});
			return;
		}

		certificate.issued = false;
		await certificate.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "CERTIFICATE",
			resourceId: certificate._id.toString(),
			details: {
				user: certificate.userName,
				course: certificate.courseTitle,
				action: "revoked",
			},
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Certificate revoked successfully.",
			data: certificate,
		});
	} catch (error) {
		logger.error("Revoke certificate error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to revoke certificate.",
		});
	}
};
