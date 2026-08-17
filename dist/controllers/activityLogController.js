"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityStats = exports.getActivityLogById = exports.getActivityLogs = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const logger_1 = __importDefault(require("../utils/logger"));
const getActivityLogs = async (req, res) => {
    try {
        const { limit, page, action, resource, userId, userEmail, startDate, endDate, search, } = req.query;
        const query = {};
        // Filter by action
        if (action) {
            query.action = action;
        }
        // Filter by resource
        if (resource) {
            query.resource = resource;
        }
        // Filter by userId
        if (userId) {
            query.userId = userId;
        }
        // Filter by userEmail
        if (userEmail) {
            query.userEmail = { $regex: userEmail, $options: "i" };
        }
        // Date range filter
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }
        // Search in details
        if (search) {
            query.$or = [
                { userEmail: { $regex: search, $options: "i" } },
                { action: { $regex: search, $options: "i" } },
                { resource: { $regex: search, $options: "i" } },
                { "details.title": { $regex: search, $options: "i" } },
                { "details.name": { $regex: search, $options: "i" } },
            ];
        }
        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;
        const [logs, total] = await Promise.all([
            ActivityLog_1.default.find(query)
                .sort({ timestamp: -1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            ActivityLog_1.default.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            count: logs.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: logs,
        });
    }
    catch (error) {
        logger_1.default.error("Get activity logs error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activity logs.",
        });
    }
};
exports.getActivityLogs = getActivityLogs;
const getActivityLogById = async (req, res) => {
    try {
        const log = await ActivityLog_1.default.findById(req.params.id);
        if (!log) {
            res.status(404).json({
                success: false,
                message: "Activity log not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: log,
        });
    }
    catch (error) {
        logger_1.default.error("Get activity log by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activity log.",
        });
    }
};
exports.getActivityLogById = getActivityLogById;
const getActivityStats = async (req, res) => {
    try {
        // Get total counts by action
        const actionStats = await ActivityLog_1.default.aggregate([
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        // Get total counts by resource
        const resourceStats = await ActivityLog_1.default.aggregate([
            {
                $group: {
                    _id: "$resource",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        // Get recent activity by day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyStats = await ActivityLog_1.default.aggregate([
            {
                $match: {
                    timestamp: { $gte: sevenDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
        ]);
        const totalLogs = await ActivityLog_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                total: totalLogs,
                byAction: actionStats,
                byResource: resourceStats,
                dailyActivity: dailyStats,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Get activity stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch activity statistics.",
        });
    }
};
exports.getActivityStats = getActivityStats;
//# sourceMappingURL=activityLogController.js.map