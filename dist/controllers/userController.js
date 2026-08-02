"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
// src/controllers/userController.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const getUsers = async (req, res) => {
    try {
        const { limit, page, search, role } = req.query;
        const query = {};
        if (role) {
            query.role = role;
        }
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const [users, total] = await Promise.all([
            User_1.default.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            User_1.default.countDocuments(query),
        ]);
        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: users,
        });
    }
    catch (error) {
        logger_1.default.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        logger_1.default.error("Get user by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user.",
        });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, role } = req.body;
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "User already exists with this email.",
            });
            return;
        }
        const user = await User_1.default.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role: role || "user",
            isActive: true,
        });
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "CREATE",
            resource: "USER",
            resourceId: user._id.toString(),
            details: { email: user.email, role: user.role },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(201).json({
            success: true,
            message: "User created successfully.",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Create user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create user.",
        });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        const { firstName, lastName, email, phone, role, isActive, password } = req.body;
        // Check if email is being changed and is unique
        if (email && email !== user.email) {
            const existingUser = await User_1.default.findOne({ email });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: "Email already in use.",
                });
                return;
            }
            user.email = email;
        }
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phone)
            user.phone = phone;
        if (role)
            user.role = role;
        if (isActive !== undefined)
            user.isActive = isActive === "true" || isActive === true;
        // Update password if provided
        if (password) {
            const salt = await bcryptjs_1.default.genSalt(10);
            user.password = await bcryptjs_1.default.hash(password, salt);
        }
        await user.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "USER",
            resourceId: user._id.toString(),
            details: { email: user.email, role: user.role },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Update user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user.",
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        // Prevent deleting yourself
        if (user._id.toString() === req.userId) {
            res.status(400).json({
                success: false,
                message: "You cannot delete your own account.",
            });
            return;
        }
        await user.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "DELETE",
            resource: "USER",
            resourceId: req.params.id,
            details: { email: user.email },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });
    }
    catch (error) {
        logger_1.default.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user.",
        });
    }
};
exports.deleteUser = deleteUser;
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        // Prevent deactivating yourself
        if (user._id.toString() === req.userId) {
            res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account.",
            });
            return;
        }
        user.isActive = !user.isActive;
        await user.save();
        // Log activity
        await ActivityLog_1.default.create({
            userId: req.userId,
            userEmail: req.user?.email,
            action: "UPDATE",
            resource: "USER",
            resourceId: user._id.toString(),
            details: { email: user.email, isActive: user.isActive },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
            data: {
                id: user._id,
                email: user.email,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Toggle user status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user status.",
        });
    }
};
exports.toggleUserStatus = toggleUserStatus;
//# sourceMappingURL=userController.js.map