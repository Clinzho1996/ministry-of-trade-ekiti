// src/models/ActivityLog.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
	userId?: string;
	userEmail?: string;
	action: string;
	resource: string;
	resourceId?: string;
	details: Record<string, any>;
	ipAddress?: string;
	userAgent?: string;
	timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
	{
		userId: {
			type: String,
		},
		userEmail: {
			type: String,
		},
		action: {
			type: String,
			required: true,
			enum: [
				"CREATE",
				"READ",
				"UPDATE",
				"DELETE",
				"LOGIN",
				"LOGOUT",
				"REGISTER",
				"CONTACT_SUBMIT",
			],
		},
		resource: {
			type: String,
			required: true,
			enum: [
				"USER",
				"OPPORTUNITY",
				"NEWS",
				"EVENT",
				"GALLERY",
				"CONTACT",
				"BUSINESS",
				"UPLOAD",
				"SETTINGS",
			],
		},
		resourceId: {
			type: String,
		},
		details: {
			type: Schema.Types.Mixed,
			default: {},
		},
		ipAddress: {
			type: String,
		},
		userAgent: {
			type: String,
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
