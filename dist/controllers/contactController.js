"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContact = exports.updateContactStatus = exports.getContact = exports.getContacts = exports.submitContact = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const Contact_1 = __importDefault(require("../models/Contact"));
const logger_1 = __importDefault(require("../utils/logger"));
const submitContact = async (req, res) => {
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
        const contact = await Contact_1.default.create({
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
        await ActivityLog_1.default.create({
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
            const { contactConfirmationEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
            const { sendEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
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
            logger_1.default.info(`✅ Contact confirmation email sent to ${email}`);
        }
        catch (emailError) {
            logger_1.default.error("Failed to send contact confirmation email:", emailError);
            // Don't fail the request if email fails
        }
        // Send notification to admin (optional)
        try {
            const { contactAdminNotificationEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
            const { sendEmail } = await Promise.resolve().then(() => __importStar(require("../services/emailService")));
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
            logger_1.default.info(`✅ Admin notification email sent to ${adminEmail}`);
        }
        catch (emailError) {
            logger_1.default.error("Failed to send admin notification email:", emailError);
            // Don't fail the request if email fails
        }
        res.status(201).json({
            success: true,
            message: "Contact form submitted successfully. We will get back to you soon.",
            data: contact,
        });
    }
    catch (error) {
        logger_1.default.error("Submit contact error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit contact form.",
        });
    }
};
exports.submitContact = submitContact;
const getContacts = async (req, res) => {
    try {
        const { status, limit } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        const contacts = await Contact_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(limit ? parseInt(limit) : 0);
        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts,
        });
    }
    catch (error) {
        logger_1.default.error("Get contacts error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts.",
        });
    }
};
exports.getContacts = getContacts;
const getContact = async (req, res) => {
    try {
        const contact = await Contact_1.default.findById(req.params.id);
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
    }
    catch (error) {
        logger_1.default.error("Get contact error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contact.",
        });
    }
};
exports.getContact = getContact;
const updateContactStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        if (!status) {
            res.status(400).json({
                success: false,
                message: "Please provide a status.",
            });
            return;
        }
        const contact = await Contact_1.default.findById(req.params.id);
        if (!contact) {
            res.status(404).json({
                success: false,
                message: "Contact not found.",
            });
            return;
        }
        contact.status = status;
        if (notes)
            contact.notes = notes;
        await contact.save();
        // Log activity
        await ActivityLog_1.default.create({
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
    }
    catch (error) {
        logger_1.default.error("Update contact status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update contact.",
        });
    }
};
exports.updateContactStatus = updateContactStatus;
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact_1.default.findById(req.params.id);
        if (!contact) {
            res.status(404).json({
                success: false,
                message: "Contact not found.",
            });
            return;
        }
        await contact.deleteOne();
        // Log activity
        await ActivityLog_1.default.create({
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
    }
    catch (error) {
        logger_1.default.error("Delete contact error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete contact.",
        });
    }
};
exports.deleteContact = deleteContact;
//# sourceMappingURL=contactController.js.map