// src/models/Enrollment.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IEnrollment extends Document {
	userId: string;
	userEmail: string;
	userName?: string;
	courseId: string;
	progress: number;
	completedLessons: string[];
	status: "active" | "completed" | "dropped";
	startedAt: Date;
	completedAt?: Date;
	certificateIssued: boolean;
	certificateUrl?: string;
	lastAccessed: Date;
	rating?: number;
	review?: string;
}

const EnrollmentSchema = new Schema<IEnrollment>(
	{
		userId: {
			type: String,
			required: true,
		},
		userEmail: {
			type: String,
			required: true,
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
	},
	{
		timestamps: true,
	},
);

// Compound index for unique enrollment
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
