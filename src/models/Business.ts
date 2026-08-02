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
	// Don't call next() - just return
});

export default mongoose.model<IBusiness>("Business", BusinessSchema);
