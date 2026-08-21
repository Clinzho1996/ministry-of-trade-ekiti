// src/controllers/contactController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import ActivityLog from "../models/ActivityLog";
import Contact from "../models/Contact";
import logger from "../utils/logger";

export const submitContact = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { firstName, lastName, email, phone, subject, message } = req.body;

		// Validate required fields
		if (!firstName || !lastName || !email || !subject || !message) {
			res.status(400).json({
				success: false,
				message: "Please provide all required fields.",
			});
			return;
		}

		const contact = await Contact.create({
			firstName,
			lastName,
			email,
			phone,
			subject,
			message,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		// Log activity
		await ActivityLog.create({
			userEmail: email,
			action: "CONTACT_SUBMIT",
			resource: "CONTACT",
			resourceId: contact._id.toString(),
			details: { email, subject },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		// Send confirmation email to the user
		try {
			const { contactConfirmationEmail } = await import("../services/emailService");
			const { sendEmail } = await import("../services/emailService");
			
			const emailHtml = contactConfirmationEmail({
				name: `${firstName} ${lastName}`,
				email: email,
				subject: subject,
			});
			
			await sendEmail({
				to: email,
				subject: `We've Received Your Message - ${subject}`,
				html: emailHtml,
			});
			
			logger.info(`✅ Contact confirmation email sent to ${email}`);
		} catch (emailError) {
			logger.error("Failed to send contact confirmation email:", emailError);
			// Don't fail the request if email fails
		}

		// Send notification to admin (optional)
		try {
			const { contactAdminNotificationEmail } = await import("../services/emailService");
			const { sendEmail } = await import("../services/emailService");
			
			const adminEmailHtml = contactAdminNotificationEmail({
				name: `${firstName} ${lastName}`,
				email: email,
				phone: phone || "Not provided",
				subject: subject,
				message: message,
			});
			
			// Send to admin email
			const adminEmail = process.env.ADMIN_EMAIL || "info@ekitiinvestment.gov.ng";
			await sendEmail({
				to: adminEmail,
				subject: `New Contact Form Submission: ${subject}`,
				html: adminEmailHtml,
			});
			
			logger.info(`✅ Admin notification email sent to ${adminEmail}`);
		} catch (emailError) {
			logger.error("Failed to send admin notification email:", emailError);
			// Don't fail the request if email fails
		}

		res.status(201).json({
			success: true,
			message:
				"Contact form submitted successfully. We will get back to you soon.",
			data: contact,
		});
	} catch (error) {
		logger.error("Submit contact error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to submit contact form.",
		});
	}
};

export const getContacts = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { status, limit } = req.query;

		const query: any = {};
		if (status) {
			query.status = status;
		}

		const contacts = await Contact.find(query)
			.sort({ createdAt: -1 })
			.limit(limit ? parseInt(limit as string) : 0);

		res.status(200).json({
			success: true,
			count: contacts.length,
			data: contacts,
		});
	} catch (error) {
		logger.error("Get contacts error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch contacts.",
		});
	}
};

export const getContact = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const contact = await Contact.findById(req.params.id);
		if (!contact) {
			res.status(404).json({
				success: false,
				message: "Contact not found.",
			});
			return;
		}

		// Mark as read if still pending
		if (contact.status === "pending") {
			contact.status = "read";
			await contact.save();
		}

		res.status(200).json({
			success: true,
			data: contact,
		});
	} catch (error) {
		logger.error("Get contact error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch contact.",
		});
	}
};

export const updateContactStatus = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { status, notes } = req.body;

		if (!status) {
			res.status(400).json({
				success: false,
				message: "Please provide a status.",
			});
			return;
		}

		const contact = await Contact.findById(req.params.id);
		if (!contact) {
			res.status(404).json({
				success: false,
				message: "Contact not found.",
			});
			return;
		}

		contact.status = status;
		if (notes) contact.notes = notes;
		await contact.save();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "UPDATE",
			resource: "CONTACT",
			resourceId: contact._id.toString(),
			details: { email: contact.email, status },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Contact status updated successfully.",
			data: contact,
		});
	} catch (error) {
		logger.error("Update contact status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update contact.",
		});
	}
};

export const deleteContact = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const contact = await Contact.findById(req.params.id);
		if (!contact) {
			res.status(404).json({
				success: false,
				message: "Contact not found.",
			});
			return;
		}

		await contact.deleteOne();

		// Log activity
		await ActivityLog.create({
			userId: req.userId,
			userEmail: req.user?.email,
			action: "DELETE",
			resource: "CONTACT",
			resourceId: req.params.id,
			details: { email: contact.email },
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		res.status(200).json({
			success: true,
			message: "Contact deleted successfully.",
		});
	} catch (error) {
		logger.error("Delete contact error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete contact.",
		});
	}
};
