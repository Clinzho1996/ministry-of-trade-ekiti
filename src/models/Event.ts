// src/models/Event.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
	category: string;
	date: Date;
	location: string;
	title: string;
	description: string;
	content: string;
	image: string;
	imagePublicId?: string;
	slug: string;
	isPublished: boolean;
	featured: boolean;
	capacity?: number;
	registeredCount: number;
	isPast: boolean;
}

const EventSchema = new Schema<IEvent>(
	{
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
		},
		date: {
			type: Date,
			required: [true, "Date is required"],
		},
		location: {
			type: String,
			required: [true, "Location is required"],
		},
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Description is required"],
		},
		content: {
			type: String,
			required: [true, "Content is required"],
		},
		image: {
			type: String,
			required: [true, "Image URL is required"],
		},
		imagePublicId: {
			type: String,
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		featured: {
			type: Boolean,
			default: false,
		},
		capacity: {
			type: Number,
		},
		registeredCount: {
			type: Number,
			default: 0,
		},
		isPast: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

// Create slug from title before saving
EventSchema.pre<IEvent>("save", async function (this: IEvent) {
	if (this.isModified("title") || !this.slug) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
	// Don't call next() - just return
});

export default mongoose.model<IEvent>("Event", EventSchema);
