"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadCertificate = exports.revokeCertificate = exports.generateCertificate = exports.getUserCertificates = exports.getCertificateById = exports.getAllCertificates = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Certificate_1 = __importDefault(require("../models/Certificate"));
const Course_1 = __importDefault(require("../models/Course"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const logger_1 = __importDefault(require("../utils/logger"));
const getAllCertificates = async (req, res) => {
    try {
        const { limit, page, search, courseId, userId } = req.query;
        const query = {};
        if (courseId)
            query.courseId = courseId;
        if (userId)
            query.userId = userId;
        if (search) {
            query.$or = [
                { userEmail: { $regex: search, $options: "i" } },
                { userName: { $regex: search, $options: "i" } },
                { courseTitle: { $regex: search, $options: "i" } },
                { certificateId: { $regex: search, $options: "i" } },
            ];
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        const [certificates, total] = await Promise.all([
            Certificate_1.default.find(query).sort({ issuedAt: -1 }).skip(skip).limit(limitNum),
            Certificate_1.default.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            count: certificates.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: certificates,
        });
    }
    catch (error) {
        logger_1.default.error("Get all certificates error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch certificates.",
        });
    }
};
exports.getAllCertificates = getAllCertificates;
const getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate_1.default.findById(req.params.id);
        if (!certificate) {
            res.status(404).json({
                success: false,
                message: "Certificate not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: certificate,
        });
    }
    catch (error) {
        logger_1.default.error("Get certificate by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch certificate.",
        });
    }
};
exports.getCertificateById = getCertificateById;
// Get certificates for authenticated user
const getUserCertificates = async (req, res) => {
    try {
        const userId = req.userId;
        const userEmail = req.user?.email;
        // Build query to find certificates by userId or userEmail
        const query = userId ? { userId } : { userEmail };
        const certificates = await Certificate_1.default.find(query).sort({ issuedAt: -1 });
        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    }
    catch (error) {
        logger_1.default.error("Get user certificates error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch certificates.",
        });
    }
};
exports.getUserCertificates = getUserCertificates;
const generateCertificate = async (req, res) => {
    try {
        const { enrollmentId } = req.body;
        const enrollment = await Enrollment_1.default.findById(enrollmentId);
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
        const course = await Course_1.default.findById(enrollment.courseId);
        if (!course) {
            res.status(404).json({
                success: false,
                message: "Course not found.",
            });
            return;
        }
        // Check if certificate already exists
        const existingCertificate = await Certificate_1.default.findOne({
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
        const certificate = await Certificate_1.default.create({
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
        await ActivityLog_1.default.create({
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
    }
    catch (error) {
        logger_1.default.error("Generate certificate error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate certificate.",
        });
    }
};
exports.generateCertificate = generateCertificate;
const revokeCertificate = async (req, res) => {
    try {
        const certificate = await Certificate_1.default.findById(req.params.id);
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
        await ActivityLog_1.default.create({
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
    }
    catch (error) {
        logger_1.default.error("Revoke certificate error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to revoke certificate.",
        });
    }
};
exports.revokeCertificate = revokeCertificate;
const downloadCertificate = async (req, res) => {
    try {
        const certificate = await Certificate_1.default.findById(req.params.id);
        if (!certificate) {
            res.status(404).json({
                success: false,
                message: "Certificate not found.",
            });
            return;
        }
        // In production, generate a PDF here
        // For now, return the certificate data
        res.status(200).json({
            success: true,
            data: certificate,
        });
    }
    catch (error) {
        logger_1.default.error("Download certificate error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to download certificate.",
        });
    }
};
exports.downloadCertificate = downloadCertificate;
//# sourceMappingURL=certificateController.js.map