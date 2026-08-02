// src/middleware/upload.ts
import { Request, Response } from "express";
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback,
): void => {
	const allowedMimes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
	];

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only images are allowed."));
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB
	},
});

export const handleUploadError = (
	err: any,
	req: Request,
	res: Response,
	next: any,
): void => {
	if (err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			res.status(400).json({
				success: false,
				message: "File too large. Maximum size is 5MB.",
			});
			return;
		}
		res.status(400).json({
			success: false,
			message: err.message,
		});
		return;
	}
	if (err) {
		res.status(400).json({
			success: false,
			message: err.message,
		});
		return;
	}
	next();
};
