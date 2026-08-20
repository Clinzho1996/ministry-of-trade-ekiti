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
// src/models/Course.ts
const mongoose_1 = __importStar(require("mongoose"));
const CourseSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true,
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
    },
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    imagePublicId: {
        type: String,
    },
    instructor: {
        type: String,
        required: [true, "Instructor name is required"],
    },
    instructorBio: {
        type: String,
    },
    duration: {
        type: String,
        required: [true, "Duration is required"],
    },
    lessons: {
        type: Number,
        default: 0,
    },
    students: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    price: {
        type: Number,
        default: 0,
    },
    isFree: {
        type: Boolean,
        default: true,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    content: {
        type: String,
        required: [true, "Course content is required"],
    },
    prerequisites: {
        type: [String],
        default: [],
    },
    learningObjectives: {
        type: [String],
        default: [],
    },
    tags: {
        type: [String],
        default: [],
    },
    videoUrl: {
        type: String,
    },
    videoType: {
        type: String,
        enum: ["youtube", "vimeo", "upload", "external"],
        default: "youtube",
    },
    externalUrl: {
        type: String,
    },
    completionCertificate: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Create slug from title before saving
CourseSchema.pre("save", async function () {
    if (this.isModified("title") || !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
});
exports.default = mongoose_1.default.model("Course", CourseSchema);
//# sourceMappingURL=Course.js.map