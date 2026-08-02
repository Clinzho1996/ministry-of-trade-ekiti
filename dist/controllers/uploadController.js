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
exports.deleteImage = exports.uploadImage = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const logger_1 = __importDefault(require("../utils/logger"));
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "No image file provided.",
            });
            return;
        }
        const uploadResult = await (0, cloudinaryUpload_1.uploadToCloudinary)(req.file.buffer, "uploads", `upload_${Date.now()}`);
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "UPLOAD",
            details: { publicId: uploadResult.public_id },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Image uploaded successfully.",
            data: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Upload image error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload image.",
        });
    }
};
exports.uploadImage = uploadImage;
const deleteImage = async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            res.status(400).json({
                success: false,
                message: "Public ID is required.",
            });
            return;
        }
        const { deleteFromCloudinary } = await Promise.resolve().then(() => __importStar(require("../utils/cloudinaryUpload")));
        await deleteFromCloudinary(publicId);
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "UPLOAD",
            details: { publicId },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Image deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete image error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete image.",
        });
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=uploadController.js.map