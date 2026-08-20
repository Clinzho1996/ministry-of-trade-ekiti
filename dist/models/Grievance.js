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
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/Grievance.ts
const mongoose_1 = __importStar(require("mongoose"));
const GrievanceSchema = new mongoose_1.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email address",
        ],
    },
    phone: {
        type: String,
        trim: true,
    },
    grievanceType: {
        type: String,
        required: [true, "Grievance type is required"],
        enum: [
            "service-delivery",
            "staff-conduct",
            "procurement",
            "regulatory",
            "other",
        ],
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
    },
    incidentDate: {
        type: Date,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    expectedResolution: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "in-review", "resolved", "rejected"],
        default: "pending",
    },
    resolution: {
        type: String,
    },
    resolvedBy: {
        type: String,
    },
    resolvedAt: {
        type: Date,
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
GrievanceSchema.index({ trackingId: 1 });
GrievanceSchema.index({ email: 1 });
GrievanceSchema.index({ status: 1 });
GrievanceSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model("Grievance", GrievanceSchema);
//# sourceMappingURL=Grievance.js.map