"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsBySlug = exports.getNews = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const News_1 = __importDefault(require("../models/News"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const logger_1 = __importDefault(require("../utils/logger"));
const getNews = async (req, res) => {
    try {
        const { limit, featured, isPublished, category } = req.query;
        const query = {};
        if (isPublished !== undefined) {
            query.isPublished = isPublished === "true";
        }
        if (featured !== undefined) {
            query.featured = featured === "true";
        }
        if (category) {
            query.category = category;
        }
        const news = await News_1.default.find(query)
            .sort({ date: -1, createdAt: -1 })
            .limit(limit ? parseInt(limit) : 0);
        res.status(200).json({
            success: true,
            count: news.length,
            data: news,
        });
    }
    catch (error) {
        logger_1.default.error("Get news error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch news.",
        });
    }
};
exports.getNews = getNews;
const getNewsBySlug = async (req, res) => {
    try {
        const news = await News_1.default.findOne({ slug: req.params.slug });
        if (!news) {
            res.status(404).json({
                success: false,
                message: "News not found.",
            });
            return;
        }
        // Increment views
        news.views += 1;
        await news.save();
        res.status(200).json({
            success: true,
            data: news,
        });
    }
    catch (error) {
        logger_1.default.error("Get news by slug error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch news.",
        });
    }
};
exports.getNewsBySlug = getNewsBySlug;
const createNews = async (req, res) => {
    try {
        const { category, date, title, description, content, isPublished, featured, } = req.body;
        // Upload image if provided
        let imageUrl = "";
        let imagePublicId = "";
        if (req.file) {
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "news", `news_${Date.now()}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const news = await News_1.default.create({
            category,
            date: date || new Date(),
            title,
            description,
            content,
            image: imageUrl || "/images/placeholder.png",
            imagePublicId: imagePublicId || "",
            slug,
            isPublished: isPublished !== undefined ? isPublished : true,
            featured: featured || false,
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "NEWS",
            resourceId: news._id.toString(),
            details: { title: news.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(201).json({
            success: true,
            message: "News created successfully.",
            data: news,
        });
    }
    catch (error) {
        logger_1.default.error("Create news error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create news.",
        });
    }
};
exports.createNews = createNews;
const updateNews = async (req, res) => {
    try {
        const news = await News_1.default.findById(req.params.id);
        if (!news) {
            res.status(404).json({
                success: false,
                message: "News not found.",
            });
            return;
        }
        const { category, date, title, description, content, isPublished, featured, } = req.body;
        // Upload new image if provided and delete old one
        if (req.file) {
            if (news.imagePublicId) {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(news.imagePublicId);
            }
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "news", `news_${Date.now()}`);
            news.image = uploadResult.secure_url;
            news.imagePublicId = uploadResult.public_id;
        }
        // Update fields
        if (category)
            news.category = category;
        if (date)
            news.date = new Date(date);
        if (title) {
            news.title = title;
            // Update slug if title changes
            news.slug = title
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }
        if (description)
            news.description = description;
        if (content)
            news.content = content;
        if (isPublished !== undefined)
            news.isPublished = isPublished;
        if (featured !== undefined)
            news.featured = featured;
        await news.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "NEWS",
            resourceId: news._id.toString(),
            details: { title: news.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "News updated successfully.",
            data: news,
        });
    }
    catch (error) {
        logger_1.default.error("Update news error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update news.",
        });
    }
};
exports.updateNews = updateNews;
const deleteNews = async (req, res) => {
    try {
        const news = await News_1.default.findById(req.params.id);
        if (!news) {
            res.status(404).json({
                success: false,
                message: "News not found.",
            });
            return;
        }
        // Delete image from Cloudinary
        if (news.imagePublicId) {
            await (0, cloudinaryUpload_1.deleteFromCloudinary)(news.imagePublicId);
        }
        await news.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "NEWS",
            resourceId: req.params.id,
            details: { title: news.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "News deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete news error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete news.",
        });
    }
};
exports.deleteNews = deleteNews;
//# sourceMappingURL=newsController.js.map