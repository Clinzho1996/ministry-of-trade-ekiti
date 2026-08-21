"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGrievanceStats = exports.deleteGrievance = exports.updateGrievanceStatus = exports.getGrievanceById = exports.getAllGrievances = exports.trackGrievance = exports.submitGrievance = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Grievance_1 = __importDefault(require("../models/Grievance"));
const emailService_1 = require("../services/emailService");
const logger_1 = __importDefault(require("../utils/logger"));
// Generate unique tracking ID
const generateTrackingId = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const count = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
    return `GRV-${year}-${count}-${random}`;
};
// Submit a new grievance
const submitGrievance = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, grievanceType, priority, incidentDate, description, expectedResolution, } = req.body;
        // Validate required fields
        if (!firstName || !lastName || !email || !grievanceType || !description) {
            res.status(400).json({
                success: false,
                message: "Please provide all required fields: firstName, lastName, email, grievanceType, description.",
            });
            return;
        }
        // Generate unique tracking ID
        const trackingId = generateTrackingId();
        const grievance = await Grievance_1.default.create({
            trackingId,
            firstName,
            lastName,
            email,
            phone,
            grievanceType,
            priority: priority || "medium",
            incidentDate: incidentDate ? new Date(incidentDate) : undefined,
            description,
            expectedResolution,
            status: "pending",
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "GRIEVANCE",
            resourceId: grievance._id.toString(),
            details: {
                trackingId: grievance.trackingId,
                type: grievance.grievanceType,
            },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        const emailHtml = (0, emailService_1.grievanceAcknowledgmentEmail)({
            name: `${firstName} ${lastName}`,
            trackingId: grievance.trackingId,
            email: email,
        });
        await (0, emailService_1.sendEmail)({
            to: email,
            subject: "Grievance Acknowledgment",
            html: emailHtml,
        });
        res.status(201).json({
            success: true,
            message: "Grievance submitted successfully.",
            data: {
                trackingId: grievance.trackingId,
                status: grievance.status,
                createdAt: grievance.get("createdAt"),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Submit grievance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit grievance. Please try again.",
        });
    }
};
exports.submitGrievance = submitGrievance;
// Track grievance by tracking ID
const trackGrievance = async (req, res) => {
    try {
        const { trackingId } = req.params;
        if (!trackingId) {
            res.status(400).json({
                success: false,
                message: "Tracking ID is required.",
            });
            return;
        }
        const grievance = await Grievance_1.default.findOne({ trackingId });
        if (!grievance) {
            res.status(404).json({
                success: false,
                message: "Grievance not found with this tracking ID.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                trackingId: grievance.trackingId,
                firstName: grievance.firstName,
                lastName: grievance.lastName,
                email: grievance.email,
                grievanceType: grievance.grievanceType,
                priority: grievance.priority,
                status: grievance.status,
                description: grievance.description,
                expectedResolution: grievance.expectedResolution,
                resolution: grievance.resolution,
                createdAt: grievance.get("createdAt"),
                updatedAt: grievance.get("updatedAt"),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Track grievance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to track grievance.",
        });
    }
};
exports.trackGrievance = trackGrievance;
// Get all grievances (Admin)
const getAllGrievances = async (req, res) => {
    try {
        const { limit, page, status, search, grievanceType } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (grievanceType)
            query.grievanceType = grievanceType;
        if (search) {
            query.$or = [
                { trackingId: { $regex: search, $options: "i" } },
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;
        const [grievances, total] = await Promise.all([
            Grievance_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Grievance_1.default.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            count: grievances.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: grievances,
        });
    }
    catch (error) {
        logger_1.default.error("Get all grievances error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch grievances.",
        });
    }
};
exports.getAllGrievances = getAllGrievances;
// Get grievance by ID (Admin)
const getGrievanceById = async (req, res) => {
    try {
        const grievance = await Grievance_1.default.findById(req.params.id);
        if (!grievance) {
            res.status(404).json({
                success: false,
                message: "Grievance not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: grievance,
        });
    }
    catch (error) {
        logger_1.default.error("Get grievance by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch grievance.",
        });
    }
};
exports.getGrievanceById = getGrievanceById;
// Update grievance status (Admin)
const updateGrievanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution } = req.body;
        if (!status) {
            res.status(400).json({
                success: false,
                message: "Status is required.",
            });
            return;
        }
        const validStatuses = ["pending", "in-review", "resolved", "rejected"];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status. Must be pending, in-review, resolved, or rejected.",
            });
            return;
        }
        const grievance = await Grievance_1.default.findById(id);
        if (!grievance) {
            res.status(404).json({
                success: false,
                message: "Grievance not found.",
            });
            return;
        }
        // Store old status for comparison
        const oldStatus = grievance.status;
        // Check if status is changing to resolved or rejected, require resolution
        if ((status === "resolved" || status === "rejected") && !resolution) {
            res.status(400).json({
                success: false,
                message: "Resolution details are required when resolving or rejecting a grievance.",
            });
            return;
        }
        grievance.status = status;
        if (resolution) {
            grievance.resolution = resolution;
        }
        if (status === "resolved" || status === "rejected") {
            grievance.resolvedBy = req.user?.email || req.userId;
            grievance.resolvedAt = new Date();
        }
        await grievance.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "GRIEVANCE",
            resourceId: grievance._id.toString(),
            details: { trackingId: grievance.trackingId, status, oldStatus },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        // Send email notification based on status change
        try {
            const userEmail = grievance.email;
            const userName = `${grievance.firstName} ${grievance.lastName}`;
            if (status === "resolved" && resolution) {
                // Send resolution email
                const { grievanceResolvedEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
                const { sendEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
                const emailHtml = grievanceResolvedEmail({
                    name: userName,
                    trackingId: grievance.trackingId,
                    resolution: resolution,
                });
                await sendEmail({
                    to: userEmail,
                    subject: `Grievance Resolved - ${grievance.trackingId}`,
                    html: emailHtml,
                });
                logger_1.default.info(`✅ Resolution email sent to ${userEmail} for grievance ${grievance.trackingId}`);
            }
            else if (status === "rejected" && resolution) {
                // Send rejection email
                const { grievanceRejectedEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
                const { sendEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
                const emailHtml = grievanceRejectedEmail({
                    name: userName,
                    trackingId: grievance.trackingId,
                    reason: resolution,
                });
                await sendEmail({
                    to: userEmail,
                    subject: `Grievance Update - ${grievance.trackingId}`,
                    html: emailHtml,
                });
                logger_1.default.info(`✅ Rejection email sent to ${userEmail} for grievance ${grievance.trackingId}`);
            }
            else if (status === "in-review" && oldStatus === "pending") {
                // Send status update email
                const { grievanceStatusUpdateEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
                const { sendEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
                const emailHtml = grievanceStatusUpdateEmail({
                    name: userName,
                    trackingId: grievance.trackingId,
                    status: "In Review",
                    message: "Your grievance has been received and is currently under review by our team.",
                });
                await sendEmail({
                    to: userEmail,
                    subject: `Grievance Update - ${grievance.trackingId}`,
                    html: emailHtml,
                });
                logger_1.default.info(`Status update email sent to ${userEmail} for grievance ${grievance.trackingId}`);
            }
        }
        catch (emailError) {
            // Log email error but don't fail the request
            logger_1.default.error("Failed to send email notification:", emailError);
        }
        res.status(200).json({
            success: true,
            message: `Grievance status updated to ${status}.`,
            data: grievance,
        });
    }
    catch (error) {
        logger_1.default.error("Update grievance status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update grievance status.",
        });
    }
};
exports.updateGrievanceStatus = updateGrievanceStatus;
// Delete grievance (Admin)
const deleteGrievance = async (req, res) => {
    try {
        const grievance = await Grievance_1.default.findById(req.params.id);
        if (!grievance) {
            res.status(404).json({
                success: false,
                message: "Grievance not found.",
            });
            return;
        }
        await grievance.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "GRIEVANCE",
            resourceId: req.params.id,
            details: { trackingId: grievance.trackingId },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Grievance deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete grievance error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete grievance.",
        });
    }
};
exports.deleteGrievance = deleteGrievance;
// Get grievance statistics (Admin)
const getGrievanceStats = async (req, res) => {
    try {
        const [total, pending, inReview, resolved, rejected] = await Promise.all([
            Grievance_1.default.countDocuments(),
            Grievance_1.default.countDocuments({ status: "pending" }),
            Grievance_1.default.countDocuments({ status: "in-review" }),
            Grievance_1.default.countDocuments({ status: "resolved" }),
            Grievance_1.default.countDocuments({ status: "rejected" }),
        ]);
        // Get grievances by type
        const byType = await Grievance_1.default.aggregate([
            {
                $group: {
                    _id: "$grievanceType",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        // Get monthly trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyTrend = await Grievance_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);
        // Calculate average resolution time
        const resolvedGrievances = await Grievance_1.default.find({
            status: "resolved",
            resolvedAt: { $exists: true },
        });
        let avgResolutionTime = 0;
        if (resolvedGrievances.length > 0) {
            const totalDays = resolvedGrievances.reduce((acc, curr) => {
                const createdAt = curr.get("createdAt");
                if (curr.resolvedAt && createdAt) {
                    const diff = curr.resolvedAt.getTime() - createdAt.getTime();
                    const days = diff / (1000 * 60 * 60 * 24);
                    return acc + days;
                }
                return acc;
            }, 0);
            avgResolutionTime = Math.round(totalDays / resolvedGrievances.length);
        }
        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                inReview,
                resolved,
                rejected,
                byType,
                monthlyTrend,
                avgResolutionTime,
                resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Get grievance stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch grievance statistics.",
        });
    }
};
exports.getGrievanceStats = getGrievanceStats;
//# sourceMappingURL=grievanceController.js.map