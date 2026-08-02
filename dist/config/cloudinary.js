"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCloudinary = void 0;
// src/config/cloudinary.ts
const cloudinary_1 = require("cloudinary");
const logger_1 = __importDefault(require("../utils/logger"));
const configureCloudinary = () => {
    try {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        logger_1.default.info('Cloudinary configured successfully');
    }
    catch (error) {
        logger_1.default.error('Cloudinary configuration error:', error);
    }
};
exports.configureCloudinary = configureCloudinary;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map