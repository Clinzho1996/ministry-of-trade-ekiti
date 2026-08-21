// src/controllers/businessController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Business from "../models/Business";
import {
	deleteFromCloudinary,
	uploadToCloudinary,
} from "../utils/cloudinaryUpload";
import logger from "../utils/logger";

export const getBusinesses = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const {
			limit,
			category,
			location,
			isVerified,
			isActive,
			featured,
			search,
		} = req.query;

		const query: any = {};
		if (isActive !== undefined) {
			query.isActive = isActive === "true";
		}
		if (isVerified !== undefined) {
			query.isVerified = isVerified === "true";
		}
		if (featured !== undefined) {
			query.featured = featured === "true";
		}
		if (category) {
			query.category = category;
		}
		if (location) {
			query.location = location;
		}
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
				{ location: { $regex: search, $options: "i" } },
			];
		}

		const businesses = await Business.find(query)
			.sort({ featured: -1, rating: -1, views: -1, createdAt: -1 })
			.limit(limit ? parseInt(limit as string) : 0);

		res.status(200).json({
			success: true,
			count: businesses.length,
			data: businesses,
		});
	} catch (error) {
		logger.error("Get businesses error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch businesses.",
		});
	}
};

export const getBusinessBySlug = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const business = await Business.findOne({ slug: req.params.slug });
		if (!business) {
			res.status(404).json({
				success: false,
				message: "Business not found.",
			});
			return;
		}

		// Increment views
		business.views += 1;
		await business.save();

		res.status(200).json({
			success: true,
			data: business,
		});
	} catch (error) {
		logger.error("Get business by slug error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch business.",
		});
	}
};

export const getBusiness = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const business = await Business.findById(req.params.id);
		if (!business) {
			res.status(404).json({
				success: false,
				message: "Business not found.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: business,
		});
	} catch (error) {
		logger.error("Get business error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch business.",
		});
	}
};

export const createBusiness = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const {
			name,
			description,
			category,
			subCategory,
			location,
			address,
			phone,
			email,
			website,
			openingHours,
			socialMedia,
			establishedYear,
			employees,
			isVerified,
			isActive,
			featured,
		} = req.body;

		// Upload logo
		let logoUrl = "";
		let logoPublicId = "";
		if (req.file) {
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"businesses/logos",
				`business_${Date.now()}`,
			);
			logoUrl = uploadResult.secure_url;
			logoPublicId = uploadResult.public_id;
		} else {
			res.status(400).json({
				success: false,
				message: "Business logo is required.",
			});
			return;
		}

		// Generate slug from name
		const slug = name
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		const business = await Business.create({
			name,
			description,
			category,
			subCategory,
			location,
			address,
			phone,
			email,
			website,
			logo: logoUrl,
			logoPublicId,
			openingHours: openingHours ? JSON.parse(openingHours) : undefined,
			socialMedia: socialMedia ? JSON.parse(socialMedia) : undefined,
			establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
			employees: employees ? parseInt(employees) : undefined,
			isVerified: isVerified === "true",
			isActive: isActive !== "false",
			featured: featured === "true",
			slug,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "BUSINESS",
			resourceId: business._id.toString(),
			details: { name: business.name },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(201).json({
			success: true,
			message: "Business created successfully.",
			data: business,
		});
	} catch (error) {
		logger.error("Create business error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create business.",
		});
	}
};

export const updateBusiness = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const business = await Business.findById(req.params.id);
		if (!business) {
			res.status(404).json({
				success: false,
				message: "Business not found.",
			});
			return;
		}

		const {
			name,
			description,
			category,
			subCategory,
			location,
			address,
			phone,
			email,
			website,
			openingHours,
			socialMedia,
			establishedYear,
			employees,
			isVerified,
			isActive,
			featured,
		} = req.body;

		// Upload new logo if provided and delete old one
		if (req.file) {
			if (business.logoPublicId) {
				await deleteFromCloudinary(business.logoPublicId);
			}
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"businesses/logos",
				`business_${Date.now()}`,
			);
			business.logo = uploadResult.secure_url;
			business.logoPublicId = uploadResult.public_id;
		}

		// Update fields
		if (name) {
			business.name = name;
			// Update slug if name changes
			business.slug = name
				.toLowerCase()
				.replace(/[^a-zA-Z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
		}
		if (description) business.description = description;
		if (category) business.category = category;
		if (subCategory) business.subCategory = subCategory;
		if (location) business.location = location;
		if (address) business.address = address;
		if (phone) business.phone = phone;
		if (email) business.email = email;
		if (website) business.website = website;
		if (openingHours) business.openingHours = JSON.parse(openingHours);
		if (socialMedia) business.socialMedia = JSON.parse(socialMedia);
		if (establishedYear) business.establishedYear = parseInt(establishedYear);
		if (employees) business.employees = parseInt(employees);
		if (isVerified !== undefined) business.isVerified = isVerified === "true";
		if (isActive !== undefined) business.isActive = isActive === "true";
		if (featured !== undefined) business.featured = featured === "true";

		await business.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "BUSINESS",
			resourceId: business._id.toString(),
			details: { name: business.name },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Business updated successfully.",
			data: business,
		});
	} catch (error) {
		logger.error("Update business error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update business.",
		});
	}
};

export const deleteBusiness = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const business = await Business.findById(req.params.id);
		if (!business) {
			res.status(404).json({
				success: false,
				message: "Business not found.",
			});
			return;
		}

		// Delete logo from Cloudinary
		if (business.logoPublicId) {
			await deleteFromCloudinary(business.logoPublicId);
		}

		// Delete all images from Cloudinary
		if (business.imagesPublicIds && business.imagesPublicIds.length > 0) {
			for (const publicId of business.imagesPublicIds) {
				await deleteFromCloudinary(publicId);
			}
		}

		await business.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "BUSINESS",
			resourceId: req.params.id,
			details: { name: business.name },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Business deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete business error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete business.",
		});
	}
};

export const uploadBusinessImages = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const business = await Business.findById(req.params.id);
		if (!business) {
			res.status(404).json({
				success: false,
				message: "Business not found.",
			});
			return;
		}

		if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
			res.status(400).json({
				success: false,
				message: "Please upload at least one image.",
			});
			return;
		}

		const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
			uploadToCloudinary(
				file.buffer,
				"businesses/images",
				`business_img_${Date.now()}`,
			),
		);

		const uploadResults = await Promise.all(uploadPromises);

		const imageUrls = uploadResults.map((result) => result.secure_url);
		const imagePublicIds = uploadResults.map((result) => result.public_id);

		business.images.push(...imageUrls);
		business.imagesPublicIds.push(...imagePublicIds);
		await business.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "BUSINESS",
			resourceId: business._id.toString(),
			details: { name: business.name, action: "uploaded_images" },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Images uploaded successfully.",
			data: business,
		});
	} catch (error) {
		logger.error("Upload business images error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to upload images.",
		});
	}
};

export const deleteBusinessImage = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const business = await Business.findById(req.params.id);
		if (!business) {
			res.status(404).json({
				success: false,
				message: "Business not found.",
			});
			return;
		}

		const { publicId } = req.body;
		if (!publicId) {
			res.status(400).json({
				success: false,
				message: "Image public ID is required.",
			});
			return;
		}

		// Remove from Cloudinary
		await deleteFromCloudinary(publicId);

		// Remove from business arrays
		const imageIndex = business.imagesPublicIds.indexOf(publicId);
		if (imageIndex > -1) {
			business.imagesPublicIds.splice(imageIndex, 1);
			business.images.splice(imageIndex, 1);
			await business.save();
		}

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "BUSINESS",
			resourceId: business._id.toString(),
			details: { name: business.name, action: "deleted_image" },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Image deleted successfully.",
			data: business,
		});
	} catch (error) {
		logger.error("Delete business image error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete image.",
		});
	}
};

export const getBusinessCategories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const categories = await Business.distinct("category");
		const locations = await Business.distinct("location");

		res.status(200).json({
			success: true,
			data: {
				categories,
				locations,
			},
		});
	} catch (error) {
		logger.error("Get business categories error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch categories.",
		});
	}
};

// src/controllers/businessController.ts

export const submitRegistration = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const {
			name,
			description,
			category,
			subCategory,
			location,
			address,
			phone,
			email,
			website,
			registrationType,
			cooperativeMembers,
			cooperativeOfficers,
			businessStructure,
			establishedYear,
			employees,
		} = req.body;

		// Upload logo
		let logoUrl = "";
		let logoPublicId = "";
		if (req.file) {
			const uploadResult = await uploadToCloudinary(
				req.file.buffer,
				"businesses/registrations",
				`reg_${Date.now()}`,
			);
			logoUrl = uploadResult.secure_url;
			logoPublicId = uploadResult.public_id;
		} else {
			res.status(400).json({
				success: false,
				message: "Business logo is required.",
			});
			return;
		}

		// Generate slug from name
		const slug = name
			.toLowerCase()
			.replace(/[^a-zA-Z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");

		const business = await Business.create({
			name,
			description,
			category,
			subCategory,
			location,
			address,
			phone,
			email,
			website,
			logo: logoUrl,
			logoPublicId,
			establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
			employees: employees ? parseInt(employees) : undefined,
			slug,
			registrationType: registrationType || "business",
			cooperativeMembers: cooperativeMembers
				? parseInt(cooperativeMembers)
				: undefined,
			cooperativeOfficers: cooperativeOfficers
				? JSON.parse(cooperativeOfficers)
				: [],
			businessStructure,
			registrationStatus: "pending",
			dateRegistered: new Date(),
			isActive: false,
			isVerified: false,
		});

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "BUSINESS_REGISTRATION",
			resourceId: business._id.toString(),
			details: { name: business.name, type: business.registrationType },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		// Send confirmation email
		try {
			const { businessRegistrationEmail } =
				await import("../services/emailService");
			const { sendEmail } = await import("../services/emailService");

			const emailHtml = businessRegistrationEmail({
				name: `${business.name}`,
				businessName: business.name,
				registrationNumber: business.registrationNumber || "Pending",
				registrationType: business.registrationType,
			});

			await sendEmail({
				to: business.email || email,
				subject: `Registration Received - ${business.registrationNumber || "Pending"}`,
				html: emailHtml,
			});

			logger.info(
				`✅ Registration confirmation email sent to ${business.email}`,
			);
		} catch (emailError) {
			logger.error(
				"Failed to send registration confirmation email:",
				emailError,
			);
		}

		res.status(201).json({
			success: true,
			message: `${
				registrationType === "cooperative" ? "Cooperative" : "Business"
			} registration submitted successfully. Awaiting approval.`,
			data: business,
		});
	} catch (error) {
		logger.error("Submit registration error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to submit registration.",
		});
	}
};

// Approve Registration
export const approveRegistration = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const business = await Business.findById(id);

		if (!business) {
			res.status(404).json({
				success: false,
				message: "Registration not found.",
			});
			return;
		}

		if (business.registrationStatus !== "pending") {
			res.status(400).json({
				success: false,
				message: `Registration is already ${business.registrationStatus}.`,
			});
			return;
		}

		business.registrationStatus = "approved";
		business.isActive = true;
		business.isVerified = true;
		business.approvedBy = req.user?.email || req.userId;
		business.approvedAt = new Date();

		await business.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "BUSINESS_REGISTRATION",
			resourceId: business._id.toString(),
			details: { name: business.name, status: "approved" },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		// Send approval email
		try {
			const { businessApprovedEmail } =
				await import("../services/emailService");
			const { sendEmail } = await import("../services/emailService");

			const emailHtml = businessApprovedEmail({
				name: business.name,
				businessName: business.name,
				registrationNumber: business.registrationNumber || "Pending",
				registrationType: business.registrationType,
			});

			await sendEmail({
				to: business.email,
				subject: `Registration Approved - ${business.registrationNumber || "Pending"}`,
				html: emailHtml,
			});

			logger.info(`✅ Approval email sent to ${business.email}`);
		} catch (emailError) {
			logger.error("Failed to send approval email:", emailError);
		}

		res.status(200).json({
			success: true,
			message: "Registration approved successfully.",
			data: business,
		});
	} catch (error) {
		logger.error("Approve registration error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to approve registration.",
		});
	}
};

// Issue Certificate
export const issueCertificate = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const business = await Business.findById(id);

		if (!business) {
			res.status(404).json({
				success: false,
				message: "Registration not found.",
			});
			return;
		}

		if (business.registrationStatus !== "approved") {
			res.status(400).json({
				success: false,
				message: "Registration must be approved before issuing certificate.",
			});
			return;
		}

		if (business.certificateIssued) {
			res.status(400).json({
				success: false,
				message: "Certificate has already been issued.",
			});
			return;
		}

		// Generate certificate URL
		const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
		const certificateUrl = `/certificates/business/${certificateId}`;

		business.certificateIssued = true;
		business.certificateUrl = certificateUrl;
		business.registrationStatus = "issued";

		await business.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "CREATE",
			resource: "CERTIFICATE",
			resourceId: business._id.toString(),
			details: { name: business.name, certificateId },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		// Send certificate email
		try {
			const { certificateIssuedEmail } =
				await import("../services/emailService");
			const { sendEmail } = await import("../services/emailService");

			const emailHtml = certificateIssuedEmail({
				name: business.name,
				businessName: business.name,
				certificateId: certificateId,
				certificateUrl: `${process.env.APP_URL || "https://ministry-of-trade-ekiti.onrender.com"}${certificateUrl}`,
			});

			await sendEmail({
				to: business.email,
				subject: `Certificate Issued - ${business.registrationNumber || "Pending"}`,
				html: emailHtml,
			});

			logger.info(`✅ Certificate email sent to ${business.email}`);
		} catch (emailError) {
			logger.error("Failed to send certificate email:", emailError);
		}

		res.status(200).json({
			success: true,
			message: "Certificate issued successfully.",
			data: business,
		});
	} catch (error) {
		logger.error("Issue certificate error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to issue certificate.",
		});
	}
};

// New: Get Pending Registrations
export const getPendingRegistrations = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const registrations = await Business.find({
			registrationStatus: "pending",
		}).sort({ createdAt: 1 });

		res.status(200).json({
			success: true,
			count: registrations.length,
			data: registrations,
		});
	} catch (error) {
		logger.error("Get pending registrations error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch pending registrations.",
		});
	}
};

// New: Get Registrations by Status
export const getRegistrationsByStatus = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { status } = req.params;
		const validStatuses = ["pending", "approved", "rejected", "issued"];

		if (!validStatuses.includes(status)) {
			res.status(400).json({
				success: false,
				message:
					"Invalid status. Must be pending, approved, rejected, or issued.",
			});
			return;
		}

		const registrations = await Business.find({
			registrationStatus: status as
				| "pending"
				| "approved"
				| "rejected"
				| "issued",
		}).sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: registrations.length,
			data: registrations,
		});
	} catch (error) {
		logger.error("Get registrations by status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch registrations.",
		});
	}
};

// New: Reject Registration
export const rejectRegistration = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const { reason } = req.body;

		const business = await Business.findById(id);

		if (!business) {
			res.status(404).json({
				success: false,
				message: "Registration not found.",
			});
			return;
		}

		if (business.registrationStatus !== "pending") {
			res.status(400).json({
				success: false,
				message: `Registration is already ${business.registrationStatus}.`,
			});
			return;
		}

		business.registrationStatus = "rejected";
		await business.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "BUSINESS_REGISTRATION",
			resourceId: business._id.toString(),
			details: { name: business.name, status: "rejected", reason },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Registration rejected.",
			data: business,
		});
	} catch (error) {
		logger.error("Reject registration error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to reject registration.",
		});
	}
};

// src/controllers/businessController.ts - Add this function

export const getBusinessCertificate = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const business = await Business.findById(req.params.id);
		if (!business) {
			res.status(404).json({
				success: false,
				message: "Business not found.",
			});
			return;
		}

		if (!business.certificateIssued) {
			res.status(404).json({
				success: false,
				message: "Certificate has not been issued for this business.",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				_id: business._id,
				name: business.name,
				description: business.description,
				category: business.category,
				location: business.location,
				address: business.address,
				registrationNumber: business.registrationNumber,
				certificateId: `CERT-${business._id}`,
				certificateUrl: business.certificateUrl,
				certificateIssued: business.certificateIssued,
				registrationType: business.registrationType,
				businessStructure: business.businessStructure,
				dateRegistered: business.dateRegistered,
				issuedAt: business.get("updatedAt"),
			},
		});
	} catch (error) {
		logger.error("Get business certificate error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch business certificate.",
		});
	}
};
