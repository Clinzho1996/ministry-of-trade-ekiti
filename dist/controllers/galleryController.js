"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGalleryItem = exports.createGalleryItem = exports.getGalleryItems = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Gallery_1 = __importDefault(require("../models/Gallery"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const logger_1 = __importDefault(require("../utils/logger"));
const getGalleryItems = async (req, res) => {
    try {
        const { category, limit, isPublished } = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        if (isPublished !== undefined) {
            query.isPublished = isPublished === "true";
        }
        const items = await Gallery_1.default.find(query)
            .sort({ date: -1, createdAt: -1 })
            .limit(limit ? parseInt(limit) : 0);
        res.status(200).json({
            success: true,
            count: items.length,
            data: items,
        });
    }
    catch (error) {
        logger_1.default.error("Get gallery items error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch gallery items.",
        });
    }
};
exports.getGalleryItems = getGalleryItems;
const createGalleryItem = async (req, res) => {
    try {
        const { title, category, date, description } = req.body;
        // Validate required fields
        if (!title || !category || !date) {
            res.status(400).json({
                success: false,
                message: "Please provide title, category, and date.",
            });
            return;
        }
        // Upload image
        let imageUrl = "";
        let imagePublicId = "";
        if (req.file) {
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "gallery", `gallery_${Date.now()}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        else {
            res.status(400).json({
                success: false,
                message: "Image is required.",
            });
            return;
        }
        const galleryItem = await Gallery_1.default.create({
            title,
            category,
            date: new Date(date),
            description,
            image: imageUrl,
            imagePublicId,
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "GALLERY",
            resourceId: galleryItem._id.toString(),
            details: { title: galleryItem.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(201).json({
            success: true,
            message: "Gallery item created successfully.",
            data: galleryItem,
        });
    }
    catch (error) {
        logger_1.default.error("Create gallery item error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create gallery item.",
        });
    }
};
exports.createGalleryItem = createGalleryItem;
const deleteGalleryItem = async (req, res) => {
    try {
        const item = await Gallery_1.default.findById(req.params.id);
        if (!item) {
            res.status(404).json({
                success: false,
                message: "Gallery item not found.",
            });
            return;
        }
        // Delete image from Cloudinary
        if (item.imagePublicId) {
            await (0, cloudinaryUpload_1.deleteFromCloudinary)(item.imagePublicId);
        }
        await item.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "GALLERY",
            resourceId: req.params.id,
            details: { title: item.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Gallery item deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete gallery item error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete gallery item.",
        });
    }
};
exports.deleteGalleryItem = deleteGalleryItem;
//# sourceMappingURL=galleryController.js.map