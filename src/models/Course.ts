// src/models/Course.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
	title: string;
	description: string;
	category: string;
	level: "beginner" | "intermediate" | "advanced";
	image: string;
	imagePublicId?: string;
	instructor: string;
	instructorBio?: string;
	duration: string;
	lessons: number;
	students: number;
	rating: number;
	price: number;
	isFree: boolean;
	isPublished: boolean;
	featured: boolean;
	slug: string;
	content: string;
	prerequisites: string[];
	learningObjectives: string[];
	tags: string[];
	videoUrl?: string;
	videoType: "youtube" | "vimeo" | "upload";
	externalUrl?: string;
	completionCertificate: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
	{
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
	},
	{
		timestamps: true,
	},
);

// Create slug from title before saving
CourseSchema.pre<ICourse>("save", async function (this: ICourse) {
	if (this.isModified("title") || !this.slug) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
});

export default mongoose.model<ICourse>("Course", CourseSchema);
