// src/models/Certificate.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ICertificate extends Document {
	userId: string;
	userEmail: string;
	userName: string;
	courseId: string;
	courseTitle: string;
	certificateId: string;
	completionDate: Date;
	certificateUrl: string;
	issued: boolean;
	issuedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
	{
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
			required: true,
		},
		courseId: {
			type: String,
			required: true,
		},
		courseTitle: {
			type: String,
			required: true,
		},
		certificateId: {
			type: String,
			required: true,
			unique: true,
		},
		completionDate: {
			type: Date,
			required: true,
		},
		certificateUrl: {
			type: String,
			required: true,
		},
		issued: {
			type: Boolean,
			default: false,
		},
		issuedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model<ICertificate>("Certificate", CertificateSchema);
