"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrollmentStats = exports.deleteEnrollment = exports.updateEnrollmentStatus = exports.getUserEnrollments = exports.getEnrollmentById = exports.getAllEnrollments = void 0;
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Course_1 = __importDefault(require("../models/Course"));
const Certificate_1 = __importDefault(require("../models/Certificate"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const logger_1 = __importDefault(require("../utils/logger"));
// Get all enrollments
const getAllEnrollments = async (req, res) => {
    try {
        const { limit, page, search, courseId, userId, status } = req.query;
        const query = {};
        if (courseId)
            query.courseId = courseId;
        if (userId)
            query.userId = userId;
        if (status)
            query.status = status;
        if (search) {
            query.$or = [
                { userEmail: { $regex: search, $options: 'i' } },
                { userName: { $regex: search, $options: 'i' } },
            ];
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        // Get course titles for each enrollment
        const [enrollments, total] = await Promise.all([
            Enrollment_1.default.find(query)
                .sort({ startedAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Enrollment_1.default.countDocuments(query),
        ]);
        // Populate course titles
        const enrichedEnrollments = await Promise.all(enrollments.map(async (enrollment) => {
            const course = await Course_1.default.findById(enrollment.courseId);
            return {
                ...enrollment.toObject(),
                courseTitle: course?.title || 'Unknown Course',
                userName: enrollment.userName || 'Unknown User',
            };
        }));
        res.status(200).json({
            success: true,
            count: enrollments.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: enrichedEnrollments,
        });
    }
    catch (error) {
        logger_1.default.error('Get all enrollments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrollments.',
        });
    }
};
exports.getAllEnrollments = getAllEnrollments;
// Get enrollment by ID
const getEnrollmentById = async (req, res) => {
    try {
        const enrollment = await Enrollment_1.default.findById(req.params.id);
        if (!enrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found.',
            });
            return;
        }
        const course = await Course_1.default.findById(enrollment.courseId);
        const certificate = await Certificate_1.default.findOne({
            userId: enrollment.userId,
            courseId: enrollment.courseId,
        });
        res.status(200).json({
            success: true,
            data: {
                ...enrollment.toObject(),
                courseTitle: course?.title || 'Unknown Course',
                certificateId: certificate?.certificateId || null,
                certificateIssued: !!certificate,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Get enrollment by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrollment.',
        });
    }
};
exports.getEnrollmentById = getEnrollmentById;
// Get enrollments for a specific user
const getUserEnrollments = async (req, res) => {
    try {
        const userId = req.userId;
        const enrollments = await Enrollment_1.default.find({ userId })
            .sort({ startedAt: -1 });
        // Populate course details
        const enrichedEnrollments = await Promise.all(enrollments.map(async (enrollment) => {
            const course = await Course_1.default.findById(enrollment.courseId);
            return {
                ...enrollment.toObject(),
                courseTitle: course?.title || 'Unknown Course',
                courseImage: course?.image || null,
                courseSlug: course?.slug || null,
            };
        }));
        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrichedEnrollments,
        });
    }
    catch (error) {
        logger_1.default.error('Get user enrollments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user enrollments.',
        });
    }
};
exports.getUserEnrollments = getUserEnrollments;
// Update enrollment status
const updateEnrollmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, progress, completedLesson } = req.body;
        const enrollment = await Enrollment_1.default.findById(id);
        if (!enrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found.',
            });
            return;
        }
        if (status) {
            enrollment.status = status;
            if (status === 'completed' && !enrollment.completedAt) {
                enrollment.completedAt = new Date();
            }
        }
        if (progress !== undefined) {
            enrollment.progress = Math.min(100, Math.max(0, progress));
        }
        if (completedLesson) {
            if (!enrollment.completedLessons.includes(completedLesson)) {
                enrollment.completedLessons.push(completedLesson);
            }
            // Recalculate progress
            const course = await Course_1.default.findById(enrollment.courseId);
            if (course && course.lessons > 0) {
                enrollment.progress = Math.min(100, Math.round((enrollment.completedLessons.length / course.lessons) * 100));
            }
        }
        // Auto-complete if progress reaches 100%
        if (enrollment.progress === 100 && enrollment.status !== 'completed') {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date();
            // Generate certificate if course offers one
            const course = await Course_1.default.findById(enrollment.courseId);
            if (course && course.completionCertificate) {
                const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
                await Certificate_1.default.create({
                    userId: enrollment.userId,
                    userEmail: enrollment.userEmail,
                    userName: enrollment.userName || 'Student',
                    courseId: course._id.toString(),
                    courseTitle: course.title,
                    certificateId,
                    completionDate: new Date(),
                    certificateUrl: `/certificates/${certificateId}`,
                    issued: true,
                    issuedAt: new Date(),
                });
                enrollment.certificateIssued = true;
            }
        }
        enrollment.lastAccessed = new Date();
        await enrollment.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: 'UPDATE',
            resource: 'ENROLLMENT',
            resourceId: enrollment._id.toString(),
            details: {
                status: enrollment.status,
                progress: enrollment.progress,
                courseId: enrollment.courseId
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        res.status(200).json({
            success: true,
            message: 'Enrollment updated successfully.',
            data: enrollment,
        });
    }
    catch (error) {
        logger_1.default.error('Update enrollment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update enrollment.',
        });
    }
};
exports.updateEnrollmentStatus = updateEnrollmentStatus;
// Delete enrollment
const deleteEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment_1.default.findById(req.params.id);
        if (!enrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found.',
            });
            return;
        }
        // Decrement students count on course
        const course = await Course_1.default.findById(enrollment.courseId);
        if (course && course.students > 0) {
            course.students -= 1;
            await course.save();
        }
        await enrollment.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: 'DELETE',
            resource: 'ENROLLMENT',
            resourceId: req.params.id,
            details: { courseId: enrollment.courseId },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        res.status(200).json({
            success: true,
            message: 'Enrollment deleted successfully.',
        });
    }
    catch (error) {
        logger_1.default.error('Delete enrollment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete enrollment.',
        });
    }
};
exports.deleteEnrollment = deleteEnrollment;
// Get enrollment statistics
const getEnrollmentStats = async (req, res) => {
    try {
        const [totalEnrollments, activeEnrollments, completedEnrollments] = await Promise.all([
            Enrollment_1.default.countDocuments(),
            Enrollment_1.default.countDocuments({ status: 'active' }),
            Enrollment_1.default.countDocuments({ status: 'completed' }),
        ]);
        // Get enrollments by course
        const courseStats = await Enrollment_1.default.aggregate([
            {
                $group: {
                    _id: '$courseId',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
        ]);
        // Populate course titles
        const courseStatsWithTitles = await Promise.all(courseStats.map(async (stat) => {
            const course = await Course_1.default.findById(stat._id);
            return {
                courseId: stat._id,
                courseTitle: course?.title || 'Unknown Course',
                count: stat.count,
            };
        }));
        // Get daily enrollment trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyTrend = await Enrollment_1.default.aggregate([
            {
                $match: {
                    startedAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$startedAt' },
                        month: { $month: '$startedAt' },
                        day: { $dayOfMonth: '$startedAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
            },
        ]);
        res.status(200).json({
            success: true,
            data: {
                total: totalEnrollments,
                active: activeEnrollments,
                completed: completedEnrollments,
                completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
                byCourse: courseStatsWithTitles,
                dailyTrend,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Get enrollment stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrollment statistics.',
        });
    }
};
exports.getEnrollmentStats = getEnrollmentStats;
//# sourceMappingURL=enrollmentController.js.map