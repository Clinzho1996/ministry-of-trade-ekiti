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
// src/models/Business.ts
const mongoose_1 = __importStar(require("mongoose"));
const BusinessSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Business name is required"],
        trim: true,
        unique: true,
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
    subCategory: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        required: [true, "Location is required"],
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    phone: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide a valid email address",
        ],
    },
    website: {
        type: String,
        trim: true,
    },
    logo: {
        type: String,
        required: [true, "Logo is required"],
    },
    certificateId: {
        type: String,
    },
    issuedAt: {
        type: Date,
    },
    logoPublicId: {
        type: String,
    },
    images: {
        type: [String],
        default: [],
    },
    imagesPublicIds: {
        type: [String],
        default: [],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    views: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    openingHours: {
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String,
    },
    socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String,
        youtube: String,
    },
    establishedYear: {
        type: Number,
    },
    employees: {
        type: Number,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // New registration fields
    registrationNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    certificateIssued: {
        type: Boolean,
        default: false,
    },
    certificateUrl: {
        type: String,
    },
    dateRegistered: {
        type: Date,
    },
    registrationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected", "issued"],
        default: "pending",
    },
    registrationType: {
        type: String,
        enum: ["business", "cooperative"],
        default: "business",
    },
    cooperativeMembers: {
        type: Number,
    },
    cooperativeOfficers: [
        {
            name: { type: String, required: true },
            position: { type: String, required: true },
            phone: String,
            email: String,
        },
    ],
    businessStructure: {
        type: String,
        enum: [
            "sole_proprietorship",
            "partnership",
            "limited_liability",
            "cooperative",
        ],
    },
    registrationDocuments: {
        type: [String],
        default: [],
    },
    approvedBy: {
        type: String,
    },
    approvedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
// Create slug from name before saving
BusinessSchema.pre("save", async function () {
    if (this.isModified("name") || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
});
// Generate registration number before saving
BusinessSchema.pre("save", async function () {
    if (this.isNew && !this.registrationNumber) {
        const prefix = this.registrationType === "cooperative" ? "COOP" : "BUS";
        const year = new Date().getFullYear();
        const count = await mongoose_1.default
            .model("Business")
            .countDocuments({ registrationType: this.registrationType });
        this.registrationNumber = `${prefix}/${year}/${String(count + 1).padStart(4, "0")}`;
    }
});
exports.default = mongoose_1.default.model("Business", BusinessSchema);
//# sourceMappingURL=Business.js.map