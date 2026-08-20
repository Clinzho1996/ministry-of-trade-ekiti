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

		// Increment views? Could add a views field if needed

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
			lessons: parseInt(lessons) || 0,
			price: parseFloat(price) || 0,
			isFree: isFree === "true" || isFree === true,
			isPublished: isPublished === "true" || isPublished === true,
			featured: featured === "true" || featured === true,
			slug,
			content,
			prerequisites: prerequisites ? JSON.parse(prerequisites) : [],
			learningObjectives: learningObjectives
				? JSON.parse(learningObjectives)
				: [],
			tags: tags ? JSON.parse(tags) : [],
			videoUrl,
			videoType: videoType || "youtube",
			externalUrl,
			completionCertificate:
				completionCertificate === "true" || completionCertificate === true,
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
				await deleteFromCloudinary(course.imagePublicId);
			}
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"courses",
				`course_${Date.now()}`,
			);
			course.image = uploadResult.secure_url;
			course.imagePublicId = uploadResult.public_id;
		}

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
		if (instructorBio) course.instructorBio = instructorBio;
		if (duration) course.duration = duration;
		if (lessons !== undefined) course.lessons = parseInt(lessons);
		if (price !== undefined) course.price = parseFloat(price);
		if (isFree !== undefined)
			course.isFree = isFree === "true" || isFree === true;
		if (isPublished !== undefined)
			course.isPublished = isPublished === "true" || isPublished === true;
		if (featured !== undefined)
			course.featured = featured === "true" || featured === true;
		if (content) course.content = content;
		if (prerequisites) course.prerequisites = JSON.parse(prerequisites);
		if (learningObjectives)
			course.learningObjectives = JSON.parse(learningObjectives);
		if (tags) course.tags = JSON.parse(tags);
		if (videoUrl) course.videoUrl = videoUrl;
		if (videoType) course.videoType = videoType;
		if (externalUrl) course.externalUrl = externalUrl;
		if (completionCertificate !== undefined)
			course.completionCertificate =
				completionCertificate === "true" || completionCertificate === true;

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
			await deleteFromCloudinary(course.imagePublicId);
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

		// In production, you would generate a PDF certificate here
		// For now, we'll create a certificate record with a placeholder URL
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
