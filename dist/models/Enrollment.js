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
// src/models/Enrollment.ts
const mongoose_1 = __importStar(require("mongoose"));
const EnrollmentSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
    },
    userEmail: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
    },
    courseId: {
        type: String,
        required: true,
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    completedLessons: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ["active", "completed", "dropped"],
        default: "active",
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
    certificateIssued: {
        type: Boolean,
        default: false,
    },
    certificateUrl: {
        type: String,
    },
    lastAccessed: {
        type: Date,
        default: Date.now,
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
    },
    review: {
        type: String,
    },
}, {
    timestamps: true,
});
// Compound index for unique enrollment
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
exports.default = mongoose_1.default.model("Enrollment", EnrollmentSchema);
//# sourceMappingURL=Enrollment.js.map