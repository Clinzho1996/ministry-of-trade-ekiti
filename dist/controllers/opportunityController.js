"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOpportunity = exports.updateOpportunity = exports.createOpportunity = exports.getOpportunity = exports.getOpportunities = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Opportunity_1 = __importDefault(require("../models/Opportunity"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const logger_1 = __importDefault(require("../utils/logger"));
const getOpportunities = async (req, res) => {
    try {
        const { limit, sector, isActive } = req.query;
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }
        if (sector) {
            query.sector = sector;
        }
        const opportunities = await Opportunity_1.default.find(query)
            .sort({ sortOrder: 1, createdAt: -1 })
            .limit(limit ? parseInt(limit) : 0);
        res.status(200).json({
            success: true,
            count: opportunities.length,
            data: opportunities,
        });
    }
    catch (error) {
        logger_1.default.error("Get opportunities error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch opportunities.",
        });
    }
};
exports.getOpportunities = getOpportunities;
const getOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity_1.default.findById(req.params.id);
        if (!opportunity) {
            res.status(404).json({
                success: false,
                message: "Opportunity not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: opportunity,
        });
    }
    catch (error) {
        logger_1.default.error("Get opportunity error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch opportunity.",
        });
    }
};
exports.getOpportunity = getOpportunity;
const createOpportunity = async (req, res) => {
    try {
        const { title, description, range, link, sector, sortOrder } = req.body;
        // Upload image if provided
        let imageUrl = "";
        let imagePublicId = "";
        if (req.file) {
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "opportunities", `opportunity_${Date.now()}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        const opportunity = await Opportunity_1.default.create({
            title,
            description,
            range,
            image: imageUrl || "/images/placeholder.png",
            imagePublicId: imagePublicId || "",
            link,
            sector,
            sortOrder: sortOrder || 0,
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "OPPORTUNITY",
            resourceId: opportunity._id.toString(),
            details: { title: opportunity.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(201).json({
            success: true,
            message: "Opportunity created successfully.",
            data: opportunity,
        });
    }
    catch (error) {
        logger_1.default.error("Create opportunity error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create opportunity.",
        });
    }
};
exports.createOpportunity = createOpportunity;
const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity_1.default.findById(req.params.id);
        if (!opportunity) {
            res.status(404).json({
                success: false,
                message: "Opportunity not found.",
            });
            return;
        }
        const { title, description, range, link, sector, sortOrder, isActive } = req.body;
        // Handle image upload
        let imageUrl = opportunity.image; // Keep existing image by default
        let imagePublicId = opportunity.imagePublicId;
        if (req.file) {
            // Delete old image from Cloudinary if it exists and is not the default
            if (opportunity.imagePublicId) {
                try {
                    await (0, cloudinaryUpload_1.deleteFromCloudinary)(opportunity.imagePublicId);
                }
                catch (error) {
                    logger_1.default.warn("Failed to delete old image:", error);
                }
            }
            // Upload new image
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "opportunities", `opportunity_${Date.now()}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        // Update fields - make sure to include the image
        opportunity.title = title || opportunity.title;
        opportunity.description = description || opportunity.description;
        opportunity.range = range || opportunity.range;
        opportunity.link = link || opportunity.link;
        opportunity.sector = sector || opportunity.sector;
        if (sortOrder !== undefined)
            opportunity.sortOrder = sortOrder;
        if (isActive !== undefined)
            opportunity.isActive = isActive;
        opportunity.image = imageUrl; // Always set the image
        opportunity.imagePublicId = imagePublicId;
        await opportunity.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "OPPORTUNITY",
            resourceId: opportunity._id.toString(),
            details: { title: opportunity.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Opportunity updated successfully.",
            data: opportunity,
        });
    }
    catch (error) {
        logger_1.default.error("Update opportunity error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update opportunity.",
        });
    }
};
exports.updateOpportunity = updateOpportunity;
const deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity_1.default.findById(req.params.id);
        if (!opportunity) {
            res.status(404).json({
                success: false,
                message: "Opportunity not found.",
            });
            return;
        }
        // Delete image from Cloudinary
        if (opportunity.imagePublicId) {
            await (0, cloudinaryUpload_1.deleteFromCloudinary)(opportunity.imagePublicId);
        }
        await opportunity.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "OPPORTUNITY",
            resourceId: req.params.id,
            details: { title: opportunity.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Opportunity deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete opportunity error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete opportunity.",
        });
    }
};
exports.deleteOpportunity = deleteOpportunity;
//# sourceMappingURL=opportunityController.js.map