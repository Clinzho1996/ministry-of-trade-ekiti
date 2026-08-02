// src/utils/cloudinaryUpload.ts
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

export interface CloudinaryUploadResult {
	secure_url: string;
	public_id: string;
	width: number;
	height: number;
	format: string;
}

export const uploadToCloudinary = (
	fileBuffer: Buffer,
	folder: string,
	fileName?: string,
): Promise<CloudinaryUploadResult> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				public_id: fileName || undefined,
				resource_type: "auto",
				allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
			},
			(error, result) => {
				if (error || !result) {
					reject(error || new Error("Upload failed"));
				} else {
					resolve({
						secure_url: result.secure_url,
						public_id: result.public_id,
						width: result.width,
						height: result.height,
						format: result.format || "unknown",
					});
				}
			},
		);

		const readableStream = new Readable();
		readableStream.push(fileBuffer);
		readableStream.push(null);
		readableStream.pipe(uploadStream);
	});
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		throw new Error(`Failed to delete image: ${error}`);
	}
};
