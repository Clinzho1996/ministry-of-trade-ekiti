"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEventBySlug = exports.getEvents = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Event_1 = __importDefault(require("../models/Event"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const logger_1 = __importDefault(require("../utils/logger"));
const getEvents = async (req, res) => {
    try {
        const { limit, featured, isPublished, isPast, category } = req.query;
        const query = {};
        if (isPublished !== undefined) {
            query.isPublished = isPublished === "true";
        }
        if (featured !== undefined) {
            query.featured = featured === "true";
        }
        if (isPast !== undefined) {
            query.isPast = isPast === "true";
        }
        if (category) {
            query.category = category;
        }
        const events = await Event_1.default.find(query)
            .sort({ date: 1, createdAt: -1 })
            .limit(limit ? parseInt(limit) : 0);
        res.status(200).json({
            success: true,
            count: events.length,
            data: events,
        });
    }
    catch (error) {
        logger_1.default.error("Get events error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch events.",
        });
    }
};
exports.getEvents = getEvents;
const getEventBySlug = async (req, res) => {
    try {
        const event = await Event_1.default.findOne({ slug: req.params.slug });
        if (!event) {
            res.status(404).json({
                success: false,
                message: "Event not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: event,
        });
    }
    catch (error) {
        logger_1.default.error("Get event by slug error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch event.",
        });
    }
};
exports.getEventBySlug = getEventBySlug;
const createEvent = async (req, res) => {
    try {
        const { category, date, location, title, description, content, isPublished, featured, capacity, } = req.body;
        // Upload image if provided
        let imageUrl = "";
        let imagePublicId = "";
        if (req.file) {
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "events", `event_${Date.now()}`);
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const event = await Event_1.default.create({
            category,
            date: new Date(date),
            location,
            title,
            description,
            content,
            image: imageUrl || "/images/placeholder.png",
            imagePublicId: imagePublicId || "",
            slug,
            isPublished: isPublished !== undefined ? isPublished : true,
            featured: featured || false,
            capacity: capacity ? parseInt(capacity) : undefined,
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "EVENT",
            resourceId: event._id.toString(),
            details: { title: event.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(201).json({
            success: true,
            message: "Event created successfully.",
            data: event,
        });
    }
    catch (error) {
        logger_1.default.error("Create event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create event.",
        });
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    try {
        const event = await Event_1.default.findById(req.params.id);
        if (!event) {
            res.status(404).json({
                success: false,
                message: "Event not found.",
            });
            return;
        }
        const { category, date, location, title, description, content, isPublished, featured, capacity, isPast, } = req.body;
        // Upload new image if provided and delete old one
        if (req.file) {
            if (event.imagePublicId) {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(event.imagePublicId);
            }
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "events", `event_${Date.now()}`);
            event.image = uploadResult.secure_url;
            event.imagePublicId = uploadResult.public_id;
        }
        // Update fields
        if (category)
            event.category = category;
        if (date)
            event.date = new Date(date);
        if (location)
            event.location = location;
        if (title) {
            event.title = title;
            // Update slug if title changes
            event.slug = title
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }
        if (description)
            event.description = description;
        if (content)
            event.content = content;
        if (isPublished !== undefined)
            event.isPublished = isPublished;
        if (featured !== undefined)
            event.featured = featured;
        if (capacity !== undefined)
            event.capacity = capacity ? parseInt(capacity) : undefined;
        if (isPast !== undefined)
            event.isPast = isPast;
        await event.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "EVENT",
            resourceId: event._id.toString(),
            details: { title: event.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Event updated successfully.",
            data: event,
        });
    }
    catch (error) {
        logger_1.default.error("Update event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update event.",
        });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const event = await Event_1.default.findById(req.params.id);
        if (!event) {
            res.status(404).json({
                success: false,
                message: "Event not found.",
            });
            return;
        }
        // Delete image from Cloudinary
        if (event.imagePublicId) {
            await (0, cloudinaryUpload_1.deleteFromCloudinary)(event.imagePublicId);
        }
        await event.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "EVENT",
            resourceId: req.params.id,
            details: { title: event.title },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Event deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete event error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete event.",
        });
    }
};
exports.deleteEvent = deleteEvent;
//# sourceMappingURL=eventController.js.map