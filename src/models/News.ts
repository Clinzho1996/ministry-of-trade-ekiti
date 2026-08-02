// src/models/News.ts
import mongoose, { Document, Schema } from "mongoose";

export interface INews extends Document {
	category: string;
	date: Date;
	title: string;
	description: string;
	content: string;
	image: string;
	imagePublicId?: string;
	slug: string;
	isPublished: boolean;
	featured: boolean;
	views: number;
}

const NewsSchema = new Schema<INews>(
	{
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
		},
		date: {
			type: Date,
			default: Date.now,
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
		views: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
);

// Create slug from title before saving
NewsSchema.pre<INews>("save", async function (this: INews) {
	if (this.isModified("title") || !this.slug) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^\w ]+/g, "")
			.replace(/ +/g, "-");
	}
});

export default mongoose.model<INews>("News", NewsSchema);
