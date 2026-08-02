"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists with this email.",
            });
            return;
        }
        // Create user
        const user = await User_1.default.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role: "user",
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: user._id.toString(),
            userEmail: user.email,
            action: "REGISTER",
            resource: "USER",
            resourceId: user._id.toString(),
            details: { email: user.email },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again.",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User_1.default.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
            return;
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials.",
            });
            return;
        }
        // Check if user is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: "Account is deactivated. Please contact admin.",
            });
            return;
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });
        // Log activity
        await ActivityLog_1.default.create({
            userId: user._id.toString(),
            userEmail: user.email,
            action: "LOGIN",
            resource: "USER",
            resourceId: user._id.toString(),
            details: { email: user.email },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        logger_1.default.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
        });
    }
};
exports.login = login;
const getCurrentUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Get current user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user data.",
        });
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=authController.js.map