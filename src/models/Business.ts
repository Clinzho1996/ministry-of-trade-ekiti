// src/models/Business.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IBusiness extends Document {
	name: string;
	description: string;
	category: string;
	subCategory?: string;
	location: string;
	address: string;
	phone?: string;
	email?: string;
	website?: string;
	logo: string;
	logoPublicId?: string;
	images: string[];
	imagesPublicIds: string[];
	isVerified: boolean;
	isActive: boolean;
	featured: boolean;
	views: number;
	rating: number;
	reviews: number;
	openingHours?: {
		monday?: string;
		tuesday?: string;
		wednesday?: string;
		thursday?: string;
		friday?: string;
		saturday?: string;
		sunday?: string;
	};
	socialMedia?: {
		facebook?: string;
		instagram?: string;
		twitter?: string;
		linkedin?: string;
		youtube?: string;
	};
	establishedYear?: number;
	employees?: number;
	slug: string;
	// New fields for registration portal
	registrationNumber?: string;
	certificateIssued: boolean;
	certificateUrl?: string;
	dateRegistered?: Date;
	registrationStatus: "pending" | "approved" | "rejected" | "issued";
	registrationType: "business" | "cooperative";
	cooperativeMembers?: number;
	cooperativeOfficers?: {
		name: string;
		position: string;
		phone?: string;
		email?: string;
	}[];
	businessStructure?:
		| "sole_proprietorship"
		| "partnership"
		| "limited_liability"
		| "cooperative";
	registrationDocuments?: string[];
	approvedBy?: string;
	approvedAt?: Date;
}

const BusinessSchema = new Schema<IBusiness>(
	{
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
	},
	{
		timestamps: true,
	},
);

// Create slug from name before saving
BusinessSchema.pre<IBusiness>("save", async function (this: IBusiness) {
	if (this.isModified("name") || !this.slug) {
		this.slug = this.name
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
});

// Generate registration number before saving
BusinessSchema.pre<IBusiness>("save", async function (this: IBusiness) {
	if (this.isNew && !this.registrationNumber) {
		const prefix = this.registrationType === "cooperative" ? "COOP" : "BUS";
		const year = new Date().getFullYear();
		const count = await mongoose
			.model("Business")
			.countDocuments({ registrationType: this.registrationType });
		this.registrationNumber = `${prefix}/${year}/${String(count + 1).padStart(4, "0")}`;
	}
});

export default mongoose.model<IBusiness>("Business", BusinessSchema);
