// src/controllers/courseController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Certificate from "../models/Certificate";
import Course from "../models/Course";
import Enrollment from "../models/Enrollment";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../utils/cloudinaryUpload";
import logger from "../utils/logger";

// Helper function to convert comma-separated string to array
const parseStringToArray = (value: any): string[] => {
	if (!value) return [];
	if (Array.isArray(value)) return value;
	if (typeof value === "string") {
		// If it's a JSON string, parse it
		if (value.startsWith("[")) {
			try {
				return JSON.parse(value);
			} catch {
				return value
					.split(",")
					.map((item) => item.trim())
					.filter(Boolean);
			}
		}
		// Otherwise split by comma
		return value
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);
	}
	return [];
};

// Helper function to parse number
const parseNumber = (value: any): number => {
	if (!value) return 0;
	if (typeof value === "number") return value;
	return parseInt(value) || 0;
};

// Helper function to parse boolean
const parseBoolean = (value: any): boolean => {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") {
		return value === "true" || value === "1";
	}
	return Boolean(value);
};

// Get all courses
export const getCourses = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { limit, category, level, isPublished, featured, search } = req.query;

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
		if (level) {
			query.level = level;
		}
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ instructor: { $regex: search, $options: "i" } },
			];
		}

		const courses = await Course.find(query)
			.sort({ featured: -1, createdAt: -1 })
			.limit(limit ? parseInt(limit as string) : 0);

		res.status(200).json({
			success: true,
			count: courses.length,
			data: courses,
		});
	} catch (error) {
		logger.error("Get courses error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch courses.",
		});
	}
};

// Get course by slug
export const getCourseBySlug = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const course = await Course.findOne({ slug: req.params.slug });
		if (!course) {
			res.status(404).json({
				success: false,
				message: "Course not found.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: course,
		});
	} catch (error) {
		logger.error("Get course by slug error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch course.",
		});
	}
};

// Create course
export const createCourse = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const {
			title,
			description,
			category,
			level,
			instructor,
			instructorBio,
			duration,
			lessons,
			price,
			isFree,
			isPublished,
			featured,
			content,
			prerequisites,
			learningObjectives,
			tags,
			videoUrl,
			videoType,
			externalUrl,
			completionCertificate,
		} = req.body;

		// Upload image
		let imageUrl = "/images/course-placeholder.png";
		let imagePublicId = "";
		if (req.file) {
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"courses",
				`course_${Date.now()}`,
			);
			imageUrl = uploadResult.secure_url;
			imagePublicId = uploadResult.public_id;
		}

		// Generate slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		// Parse arrays from comma-separated strings
		const parsedPrerequisites = parseStringToArray(prerequisites);
		const parsedLearningObjectives = parseStringToArray(learningObjectives);
		const parsedTags = parseStringToArray(tags);

		const course = await Course.create({
			title,
			description,
			category,
			level: level || "beginner",
			image: imageUrl,
			imagePublicId,
			instructor,
			instructorBio,
			duration,
			lessons: parseNumber(lessons),
			price: parseNumber(price),
			isFree: parseBoolean(isFree),
			isPublished: parseBoolean(isPublished),
			featured: parseBoolean(featured),
			slug,
			content,
			prerequisites: parsedPrerequisites,
			learningObjectives: parsedLearningObjectives,
			tags: parsedTags,
			videoUrl,
			videoType: videoType || "youtube",
			externalUrl,
			completionCertificate: parseBoolean(completionCertificate),
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "COURSE",
			resourceId: course._id.toString(),
			details: { title: course.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Course created successfully.",
			data: course,
		});
	} catch (error) {
		logger.error("Create course error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create course.",
		});
	}
};

// Update course
export const updateCourse = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const course = await Course.findById(req.params.id);
		if (!course) {
			res.status(404).json({
				success: false,
				message: "Course not found.",
			});
			return;
		}

		const {
			title,
			description,
			category,
			level,
			instructor,
			instructorBio,
			duration,
			lessons,
			price,
			isFree,
			isPublished,
			featured,
			content,
			prerequisites,
			learningObjectives,
			tags,
			videoUrl,
			videoType,
			externalUrl,
			completionCertificate,
		} = req.body;

		// Upload new image if provided
		if (req.file) {
			if (course.imagePublicId) {
				try {
					await deleteFromCloudinary(course.imagePublicId);
				} catch (error) {
					logger.warn("Failed to delete old image:", error);
				}
			}
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"courses",
				`course_${Date.now()}`,
			);
			course.image = uploadResult.secure_url;
			course.imagePublicId = uploadResult.public_id;
		}

		// Parse arrays from comma-separated strings
		const parsedPrerequisites = parseStringToArray(prerequisites);
		const parsedLearningObjectives = parseStringToArray(learningObjectives);
		const parsedTags = parseStringToArray(tags);

		// Update fields
		if (title) {
			course.title = title;
			course.slug = title
				.toLowerCase()
				.replace(/[^a-zA-Z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
		}
		if (description) course.description = description;
		if (category) course.category = category;
		if (level) course.level = level;
		if (instructor) course.instructor = instructor;
		if (instructorBio !== undefined) course.instructorBio = instructorBio;
		if (duration) course.duration = duration;
		if (lessons !== undefined) course.lessons = parseNumber(lessons);
		if (price !== undefined) course.price = parseNumber(price);
		if (isFree !== undefined) course.isFree = parseBoolean(isFree);
		if (isPublished !== undefined)
			course.isPublished = parseBoolean(isPublished);
		if (featured !== undefined) course.featured = parseBoolean(featured);
		if (content) course.content = content;
		course.prerequisites = parsedPrerequisites;
		course.learningObjectives = parsedLearningObjectives;
		course.tags = parsedTags;
		if (videoUrl !== undefined) course.videoUrl = videoUrl;
		if (videoType) course.videoType = videoType;
		if (externalUrl !== undefined) course.externalUrl = externalUrl;
		if (completionCertificate !== undefined)
			course.completionCertificate = parseBoolean(completionCertificate);

		await course.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "COURSE",
			resourceId: course._id.toString(),
			details: { title: course.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Course updated successfully.",
			data: course,
		});
	} catch (error) {
		logger.error("Update course error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update course.",
		});
	}
};

// Delete course
export const deleteCourse = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const course = await Course.findById(req.params.id);
		if (!course) {
			res.status(404).json({
				success: false,
				message: "Course not found.",
			});
			return;
		}

		// Delete image from Cloudinary
		if (course.imagePublicId) {
			try {
				await deleteFromCloudinary(course.imagePublicId);
			} catch (error) {
				logger.warn("Failed to delete image from Cloudinary:", error);
			}
		}

		// Delete all enrollments for this course
		await Enrollment.deleteMany({ courseId: course._id.toString() });

		await course.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "COURSE",
			resourceId: req.params.id,
			details: { title: course.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Course deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete course error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete course.",
		});
	}
};

// Get course enrollments
export const getCourseEnrollments = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { courseId } = req.params;
		const { status } = req.query;

		const query: any = { courseId };
		if (status) {
			query.status = status;
		}

		const enrollments = await Enrollment.find(query).sort({ startedAt: -1 });

		res.status(200).json({
			success: true,
			count: enrollments.length,
			data: enrollments,
		});
	} catch (error) {
		logger.error("Get course enrollments error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch enrollments.",
		});
	}
};

// Update enrollment progress
export const updateProgress = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { progress, completedLesson } = req.body;

		const enrollment = await Enrollment.findOne({
			_id: id,
			userId: req.userId,
		});
		if (!enrollment) {
			res.status(404).json({
				success: false,
				message: "Enrollment not found.",
			});
			return;
		}

		if (progress !== undefined) {
			enrollment.progress = Math.min(100, Math.max(0, progress));
		}

		if (completedLesson) {
			if (!enrollment.completedLessons.includes(completedLesson)) {
				enrollment.completedLessons.push(completedLesson);
			}
			// Recalculate progress based on completed lessons
			const course = await Course.findById(enrollment.courseId);
			if (course && course.lessons > 0) {
				enrollment.progress = Math.min(
					100,
					Math.round(
						(enrollment.completedLessons.length / course.lessons) * 100,
					),
				);
			}
		}

		// Check if course is completed
		if (enrollment.progress === 100 && enrollment.status !== "completed") {
			enrollment.status = "completed";
			enrollment.completedAt = new Date();

			// Generate certificate if course offers one
			const course = await Course.findById(enrollment.courseId);
			if (course && course.completionCertificate) {
				await generateCertificate(enrollment, course);
			}
		}

		enrollment.lastAccessed = new Date();
		await enrollment.save();

		res.status(200).json({
			success: true,
			message: "Progress updated successfully.",
			data: enrollment,
		});
	} catch (error) {
		logger.error("Update progress error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update progress.",
		});
	}
};

// Generate certificate
const generateCertificate = async (enrollment: any, course: any) => {
	try {
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

		return certificate;
	} catch (error) {
		logger.error("Generate certificate error:", error);
		throw error;
	}
};

// Get certificates for a user
export const getUserCertificates = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const certificates = await Certificate.find({ userId: req.userId }).sort({
			issuedAt: -1,
		});

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

// Enroll user in course
export const enrollUser = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { courseId } = req.body;
		const userId = req.userId;
		const userEmail = req.user?.email;
		const userName = `${req.user?.firstName} ${req.user?.lastName}`;

		// Check if already enrolled
		const existingEnrollment = await Enrollment.findOne({ userId, courseId });
		if (existingEnrollment) {
			res.status(400).json({
				success: false,
				message: "User already enrolled in this course.",
			});
			return;
		}

		// Check if course exists
		const course = await Course.findById(courseId);
		if (!course) {
			res.status(404).json({
				success: false,
				message: "Course not found.",
			});
			return;
		}

		const enrollment = await Enrollment.create({
			userId,
			userEmail,
			courseId,
			status: "active",
			startedAt: new Date(),
			lastAccessed: new Date(),
		});

		// Increment students count
		course.students += 1;
		await course.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "ENROLLMENT",
			resourceId: enrollment._id.toString(),
			details: { course: course.title },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Successfully enrolled in course.",
			data: enrollment,
		});
	} catch (error) {
		logger.error("Enroll user error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to enroll in course.",
		});
	}
};
