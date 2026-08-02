// src/models/User.ts
import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone?: string;
	role: "admin" | "user" | "editor";
	isActive: boolean;
	lastLogin?: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
	{
		firstName: {
			type: String,
			required: [true, "First name is required"],
			trim: true,
			minlength: [2, "First name must be at least 2 characters"],
			maxlength: [50, "First name cannot exceed 50 characters"],
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
			trim: true,
			minlength: [2, "Last name must be at least 2 characters"],
			maxlength: [50, "Last name cannot exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email address",
			],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		phone: {
			type: String,
			trim: true,
		},
		role: {
			type: String,
			enum: ["admin", "user", "editor"],
			default: "user",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLogin: {
			type: Date,
		},
	},
	{
		timestamps: true,
	},
);

// Hash password before saving
UserSchema.pre<IUser>("save", async function () {
	if (!this.isModified("password")) {
		return;
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
	candidatePassword: string,
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
