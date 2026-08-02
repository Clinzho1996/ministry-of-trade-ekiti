"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinessCategories = exports.deleteBusinessImage = exports.uploadBusinessImages = exports.deleteBusiness = exports.updateBusiness = exports.createBusiness = exports.getBusiness = exports.getBusinessBySlug = exports.getBusinesses = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Business_1 = __importDefault(require("../models/Business"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const logger_1 = __importDefault(require("../utils/logger"));
const getBusinesses = async (req, res) => {
    try {
        const { limit, category, location, isVerified, isActive, featured, search, } = req.query;
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }
        if (isVerified !== undefined) {
            query.isVerified = isVerified === "true";
        }
        if (featured !== undefined) {
            query.featured = featured === "true";
        }
        if (category) {
            query.category = category;
        }
        if (location) {
            query.location = location;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }
        const businesses = await Business_1.default.find(query)
            .sort({ featured: -1, rating: -1, views: -1, createdAt: -1 })
            .limit(limit ? parseInt(limit) : 0);
        res.status(200).json({
            success: true,
            count: businesses.length,
            data: businesses,
        });
    }
    catch (error) {
        logger_1.default.error("Get businesses error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch businesses.",
        });
    }
};
exports.getBusinesses = getBusinesses;
const getBusinessBySlug = async (req, res) => {
    try {
        const business = await Business_1.default.findOne({ slug: req.params.slug });
        if (!business) {
            res.status(404).json({
                success: false,
                message: "Business not found.",
            });
            return;
        }
        // Increment views
        business.views += 1;
        await business.save();
        res.status(200).json({
            success: true,
            data: business,
        });
    }
    catch (error) {
        logger_1.default.error("Get business by slug error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch business.",
        });
    }
};
exports.getBusinessBySlug = getBusinessBySlug;
const getBusiness = async (req, res) => {
    try {
        const business = await Business_1.default.findById(req.params.id);
        if (!business) {
            res.status(404).json({
                success: false,
                message: "Business not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: business,
        });
    }
    catch (error) {
        logger_1.default.error("Get business error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch business.",
        });
    }
};
exports.getBusiness = getBusiness;
const createBusiness = async (req, res) => {
    try {
        const { name, description, category, subCategory, location, address, phone, email, website, openingHours, socialMedia, establishedYear, employees, isVerified, isActive, featured, } = req.body;
        // Upload logo
        let logoUrl = "";
        let logoPublicId = "";
        if (req.file) {
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "businesses/logos", `business_${Date.now()}`);
            logoUrl = uploadResult.secure_url;
            logoPublicId = uploadResult.public_id;
        }
        else {
            res.status(400).json({
                success: false,
                message: "Business logo is required.",
            });
            return;
        }
        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const business = await Business_1.default.create({
            name,
            description,
            category,
            subCategory,
            location,
            address,
            phone,
            email,
            website,
            logo: logoUrl,
            logoPublicId,
            openingHours: openingHours ? JSON.parse(openingHours) : undefined,
            socialMedia: socialMedia ? JSON.parse(socialMedia) : undefined,
            establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
            employees: employees ? parseInt(employees) : undefined,
            isVerified: isVerified === "true",
            isActive: isActive !== "false",
            featured: featured === "true",
            slug,
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "BUSINESS",
            resourceId: business._id.toString(),
            details: { name: business.name },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(201).json({
            success: true,
            message: "Business created successfully.",
            data: business,
        });
    }
    catch (error) {
        logger_1.default.error("Create business error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create business.",
        });
    }
};
exports.createBusiness = createBusiness;
const updateBusiness = async (req, res) => {
    try {
        const business = await Business_1.default.findById(req.params.id);
        if (!business) {
            res.status(404).json({
                success: false,
                message: "Business not found.",
            });
            return;
        }
        const { name, description, category, subCategory, location, address, phone, email, website, openingHours, socialMedia, establishedYear, employees, isVerified, isActive, featured, } = req.body;
        // Upload new logo if provided and delete old one
        if (req.file) {
            if (business.logoPublicId) {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(business.logoPublicId);
            }
            const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "businesses/logos", `business_${Date.now()}`);
            business.logo = uploadResult.secure_url;
            business.logoPublicId = uploadResult.public_id;
        }
        // Update fields
        if (name) {
            business.name = name;
            // Update slug if name changes
            business.slug = name
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }
        if (description)
            business.description = description;
        if (category)
            business.category = category;
        if (subCategory)
            business.subCategory = subCategory;
        if (location)
            business.location = location;
        if (address)
            business.address = address;
        if (phone)
            business.phone = phone;
        if (email)
            business.email = email;
        if (website)
            business.website = website;
        if (openingHours)
            business.openingHours = JSON.parse(openingHours);
        if (socialMedia)
            business.socialMedia = JSON.parse(socialMedia);
        if (establishedYear)
            business.establishedYear = parseInt(establishedYear);
        if (employees)
            business.employees = parseInt(employees);
        if (isVerified !== undefined)
            business.isVerified = isVerified === "true";
        if (isActive !== undefined)
            business.isActive = isActive === "true";
        if (featured !== undefined)
            business.featured = featured === "true";
        await business.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "BUSINESS",
            resourceId: business._id.toString(),
            details: { name: business.name },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Business updated successfully.",
            data: business,
        });
    }
    catch (error) {
        logger_1.default.error("Update business error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update business.",
        });
    }
};
exports.updateBusiness = updateBusiness;
const deleteBusiness = async (req, res) => {
    try {
        const business = await Business_1.default.findById(req.params.id);
        if (!business) {
            res.status(404).json({
                success: false,
                message: "Business not found.",
            });
            return;
        }
        // Delete logo from Cloudinary
        if (business.logoPublicId) {
            await (0, cloudinaryUpload_1.deleteFromCloudinary)(business.logoPublicId);
        }
        // Delete all images from Cloudinary
        if (business.imagesPublicIds && business.imagesPublicIds.length > 0) {
            for (const publicId of business.imagesPublicIds) {
                await (0, cloudinaryUpload_1.deleteFromCloudinary)(publicId);
            }
        }
        await business.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "BUSINESS",
            resourceId: req.params.id,
            details: { name: business.name },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Business deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete business error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete business.",
        });
    }
};
exports.deleteBusiness = deleteBusiness;
const uploadBusinessImages = async (req, res) => {
    try {
        const business = await Business_1.default.findById(req.params.id);
        if (!business) {
            res.status(404).json({
                success: false,
                message: "Business not found.",
            });
            return;
        }
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({
                success: false,
                message: "Please upload at least one image.",
            });
            return;
        }
        const uploadPromises = req.files.map((file) => (0, cloudinaryUpload_1.uploadToCloudinary)(file.buffer, "businesses/images", `business_img_${Date.now()}`));
        const uploadResults = await Promise.all(uploadPromises);
        const imageUrls = uploadResults.map((result) => result.secure_url);
        const imagePublicIds = uploadResults.map((result) => result.public_id);
        business.images.push(...imageUrls);
        business.imagesPublicIds.push(...imagePublicIds);
        await business.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "BUSINESS",
            resourceId: business._id.toString(),
            details: { name: business.name, action: "uploaded_images" },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Images uploaded successfully.",
            data: business,
        });
    }
    catch (error) {
        logger_1.default.error("Upload business images error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload images.",
        });
    }
};
exports.uploadBusinessImages = uploadBusinessImages;
const deleteBusinessImage = async (req, res) => {
    try {
        const business = await Business_1.default.findById(req.params.id);
        if (!business) {
            res.status(404).json({
                success: false,
                message: "Business not found.",
            });
            return;
        }
        const { publicId } = req.body;
        if (!publicId) {
            res.status(400).json({
                success: false,
                message: "Image public ID is required.",
            });
            return;
        }
        // Remove from Cloudinary
        await (0, cloudinaryUpload_1.deleteFromCloudinary)(publicId);
        // Remove from business arrays
        const imageIndex = business.imagesPublicIds.indexOf(publicId);
        if (imageIndex > -1) {
            business.imagesPublicIds.splice(imageIndex, 1);
            business.images.splice(imageIndex, 1);
            await business.save();
        }
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "BUSINESS",
            resourceId: business._id.toString(),
            details: { name: business.name, action: "deleted_image" },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Image deleted successfully.",
            data: business,
        });
    }
    catch (error) {
        logger_1.default.error("Delete business image error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete image.",
        });
    }
};
exports.deleteBusinessImage = deleteBusinessImage;
const getBusinessCategories = async (req, res) => {
    try {
        const categories = await Business_1.default.distinct("category");
        const locations = await Business_1.default.distinct("location");
        res.status(200).json({
            success: true,
            data: {
                categories,
                locations,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Get business categories error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories.",
        });
    }
};
exports.getBusinessCategories = getBusinessCategories;
//# sourceMappingURL=businessController.js.map