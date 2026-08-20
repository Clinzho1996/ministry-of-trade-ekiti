// src/models/Grievance.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IGrievance extends Document {
	trackingId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	grievanceType: string;
	priority: string;
	incidentDate?: Date;
	description: string;
	expectedResolution?: string;
	status: "pending" | "in-review" | "resolved" | "rejected";
	resolution?: string;
	resolvedBy?: string;
	resolvedAt?: Date;
	ipAddress?: string;
	userAgent?: string;
}

const GrievanceSchema = new Schema<IGrievance>(
	{
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
	},
	{
		timestamps: true,
	},
);

// Indexes for faster queries
GrievanceSchema.index({ trackingId: 1 });
GrievanceSchema.index({ email: 1 });
GrievanceSchema.index({ status: 1 });
GrievanceSchema.index({ createdAt: -1 });

export default mongoose.model<IGrievance>("Grievance", GrievanceSchema);
