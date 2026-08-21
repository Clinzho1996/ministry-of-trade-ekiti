"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseProgressEmail = exports.courseCompletionEmail = exports.courseEnrollmentEmail = exports.contactAdminNotificationEmail = exports.businessApprovedEmail = exports.grievanceRejectedEmail = exports.grievanceStatusUpdateEmail = exports.certificateIssuedEmail = exports.businessRegistrationEmail = exports.contactConfirmationEmail = exports.grievanceResolvedEmail = exports.grievanceAcknowledgmentEmail = exports.sendEmail = exports.getBaseTemplate = void 0;
// src/services/emailService.ts
const resend_1 = require("resend");
let resendInstance = null;
const getResendInstance = () => {
    if (!resendInstance) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY environment variable");
        }
        resendInstance = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
};
// ================= BASE TEMPLATE =================
const getBaseTemplate = (content, title) => {
    const baseUrl = process.env.APP_URL || "https://mtiic.devclinton.org"; // Default base URL if not set
    const imageBaseUrl = process.env.EMAIL_IMAGE_BASE_URL || baseUrl;
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title || "Ekiti Investment"}</title>
    <style type="text/css">
        /* Client-specific Resets */
        #outlook a { padding:0; }
        body { width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0; }
        .ExternalClass { width:100%; }
        .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
        table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
        img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
        
        /* Dark mode overrides where supported */
        @media (prefers-color-scheme: dark) {
            body, .bg-wrapper { background-color: #0F172A !important; }
            .body-card { background-color: #1E293B !important; border-color: #334155 !important; }
            .form-body p, .form-body h2, .form-body strong, .form-body div { color: #E2E8F0 !important; }
            .footer-card { background-color: #1E293B !important; }
            .footer-text, .footer-text a { color: #94A3B8 !important; }
            .footer-link { color: #E2E8F0 !important; }
            .social-icon { filter: brightness(0) invert(1) !important; }
        }

        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; padding-left: 10px !important; padding-right: 10px !important; }
            .body-card { padding: 20px 15px !important; }
            .otp-box { font-size: 26px !important; letter-spacing: 4px !important; }
            .amount-box .amount { font-size: 24px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    
    <!-- Outer Container Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="bg-wrapper" style="background-color: #f6f8fa; width: 100%;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                
                <!-- Main Email Card (600px) -->
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="width: 100%; max-width: 600px;">
                    <tr>
                        <td align="center" class="body-card" style="background-color: #ffffff; border: 1px solid #e2e4e9; border-radius: 24px; padding: 30px; box-sizing: border-box;">
                            
                            <!-- Header Logo -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                                <tr>
                                    <td align="center">
                                        <img src="${imageBaseUrl}/images/mtiic.png" alt="Ekiti State Government" width="80" height="80" style="display: block; width: 80px; height: 80px; border: 0;" />
                                        <h1 style="font-size: 18px; color: #016630; margin: 8px 0 0 0; font-weight: 700; font-family: 'Inter', sans-serif;">
                                            Ekiti State Government
                                        </h1>
                                        <p style="font-size: 12px; color: #6B7280; margin: 0; font-weight: 500;">
                                            Ministry of Trade, Industry, Investment and Cooperatives
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Email Main Content Body -->
                            ${content}

                            <!-- FOOTER TABLE -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer-card" style="margin-top: 30px; background-color: #f0fdf4; border-radius: 20px; text-align: center; width: 100%; border: 1px solid #dcfce7;">
                                <tr>
                                    <td align="center" style="padding: 28px 20px;">
                                        
                                        <!-- Social Icons Row -->
                                        <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px auto;">
                                            <tr>
                                                <td align="center" style="padding: 0 6px;">
                                                    <a href="https://x.com/ekitistate" target="_blank" style="text-decoration: none;">
                                                        <img src="${imageBaseUrl}/images/x.png" alt="X" width="32" height="32" class="social-icon" style="display: block; width: 32px; height: 32px; border: 0;" />
                                                    </a>
                                                </td>
                                                <td align="center" style="padding: 0 6px;">
                                                    <a href="https://www.linkedin.com/company/ekitistate" target="_blank" style="text-decoration: none;">
                                                        <img src="${imageBaseUrl}/images/linkedin.png" alt="LinkedIn" width="32" height="32" class="social-icon" style="display: block; width: 32px; height: 32px; border: 0;" />
                                                    </a>
                                                </td>
                                                <td align="center" style="padding: 0 6px;">
                                                    <a href="https://www.facebook.com/ekitistate" target="_blank" style="text-decoration: none;">
                                                        <img src="${imageBaseUrl}/images/facebook.png" alt="Facebook" width="32" height="32" class="social-icon" style="display: block; width: 32px; height: 32px; border: 0;" />
                                                    </a>
                                                </td>
                                                <td align="center" style="padding: 0 6px;">
                                                    <a href="https://www.instagram.com/ekitistate" target="_blank" style="text-decoration: none;">
                                                        <img src="${imageBaseUrl}/images/instagram.png" alt="Instagram" width="32" height="32" class="social-icon" style="display: block; width: 32px; height: 32px; border: 0;" />
                                                    </a>
                                                </td>
                                                <td align="center" style="padding: 0 6px;">
                                                    <a href="https://youtube.com/ekitistate" target="_blank" style="text-decoration: none;">
                                                        <img src="${imageBaseUrl}/images/youtube.png" alt="YouTube" width="32" height="32" class="social-icon" style="display: block; width: 32px; height: 32px; border: 0;" />
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Footer Contact Lines -->
                                        <div class="footer-text" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 14px; color: #4B5563; line-height: 1.6;">
                                            <p style="margin: 0 0 4px 0; font-size: 14px; color: #4B5563;">Got a Question? Email us at</p>
                                            <p style="margin: 0; font-size: 14px; color: #016630;">
                                                <a href="mailto:info@ekitiinvestment.gov.ng" class="footer-link" style="color: #016630; font-weight: 700; text-decoration: underline;">info@ekitiinvestment.gov.ng</a> or call 
                                                <a href="tel:+2348031127787" class="footer-link" style="color: #016630; font-weight: 700; text-decoration: underline;">+234 803 112 7787</a>
                                            </p>
                                            <p style="margin: 16px 0 0 0; color: #4B5563; font-weight: 500; font-size: 14px;">
                                                Government House Complex, Ado-Ekiti, Ekiti State, Nigeria
                                            </p>
                                        </div>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
    `;
};
exports.getBaseTemplate = getBaseTemplate;
// ================= SEND EMAIL =================
const sendEmail = async ({ to, subject, html, }) => {
    try {
        const resend = getResendInstance();
        console.log("📧 Attempting to send email:", { to, subject });
        const response = await resend.emails.send({
            from: process.env.EMAIL_FROM || "info@kuditrak.com",
            to: to,
            subject: subject,
            html: html,
        });
        console.log("✅ Resend response:", response);
        return response;
    }
    catch (error) {
        console.error("❌ Error sending email with Resend:", error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
// ================= EMAIL TEMPLATES =================
// 1. Grievance Acknowledgment Email
const grievanceAcknowledgmentEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Grievance Acknowledgment
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                We have received your grievance and it has been assigned a tracking number. 
                Please keep this number for future reference.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Your Tracking ID</p>
                        <p style="font-size: 24px; color: #016630; font-weight: 700; margin: 0; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                            ${data.trackingId}
                        </p>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                You can track the status of your grievance using this ID at any time.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                We aim to acknowledge within 24 hours and resolve within 5 working days.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Thank you for bringing this to our attention.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${process.env.APP_URL || "https://mtiic.devclinton.org"}/contact" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            Track Your Grievance
                        </a>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Grievance Acknowledgment");
};
exports.grievanceAcknowledgmentEmail = grievanceAcknowledgmentEmail;
// 2. Grievance Resolved Email
const grievanceResolvedEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Grievance Resolved
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                We are pleased to inform you that your grievance (Tracking ID: <strong>${data.trackingId}</strong>) 
                has been resolved.
            </p>
            <div style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Resolution Details</p>
                <p style="font-size: 14px; color: #1F2937; margin: 0; line-height: 1.6;">
                    ${data.resolution}
                </p>
            </div>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                We appreciate your patience and cooperation throughout this process.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                If you have any further concerns, please don't hesitate to reach out.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Grievance Resolved");
};
exports.grievanceResolvedEmail = grievanceResolvedEmail;
// 3. Contact Form Confirmation Email
const contactConfirmationEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                We've Received Your Message
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Thank you for contacting the Ministry of Trade, Industry, Investment and Cooperatives.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                <strong>Subject:</strong> ${data.subject}
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Our team will review your inquiry and get back to you within 48 hours.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                In the meantime, feel free to explore our website for more information.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${process.env.APP_URL || "https://mtiic.devclinton.org"}" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            Visit Our Website
                        </a>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Message Received");
};
exports.contactConfirmationEmail = contactConfirmationEmail;
// 4. Business Registration Confirmation Email
const businessRegistrationEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Registration Received
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                We have received your ${data.registrationType} registration for 
                <strong>${data.businessName}</strong>.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Registration Number</p>
                        <p style="font-size: 20px; color: #016630; font-weight: 700; margin: 0; letter-spacing: 1px; font-family: 'Courier New', monospace;">
                            ${data.registrationNumber}
                        </p>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Your application is currently under review. You will be notified once it has been processed.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Thank you for choosing Ekiti State for your business registration.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Registration Received");
};
exports.businessRegistrationEmail = businessRegistrationEmail;
// 5. Certificate Issuance Email
const certificateIssuedEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Certificate Issued
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Congratulations! Your registration for <strong>${data.businessName}</strong> has been approved 
                and your certificate is now available.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Certificate ID</p>
                        <p style="font-size: 18px; color: #016630; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                            ${data.certificateId}
                        </p>
                    </td>
                </tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${data.certificateUrl}" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            View & Download Certificate
                        </a>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Certificate Issued");
};
exports.certificateIssuedEmail = certificateIssuedEmail;
// src/services/emailService.ts - Add these new templates
// Grievance Status Update Email
const grievanceStatusUpdateEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Grievance Status Update
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Your grievance (Tracking ID: <strong>${data.trackingId}</strong>) has been updated.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">New Status</p>
                        <p style="font-size: 20px; color: #016630; font-weight: 700; margin: 0;">
                            ${data.status}
                        </p>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                ${data.message}
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${process.env.APP_URL || "https://ministry-of-trade-ekiti.onrender.com"}/contact" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            Track Your Grievance
                        </a>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Grievance Status Update");
};
exports.grievanceStatusUpdateEmail = grievanceStatusUpdateEmail;
// Grievance Rejected Email
const grievanceRejectedEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #DC2626; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Grievance Rejected
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Your grievance (Tracking ID: <strong>${data.trackingId}</strong>) has been reviewed and rejected.
            </p>
            <div style="background-color: #FEF2F2; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #FECACA;">
                <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Reason for Rejection</p>
                <p style="font-size: 14px; color: #1F2937; margin: 0; line-height: 1.6;">
                    ${data.reason}
                </p>
            </div>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                If you believe this decision was made in error, you may submit a new grievance with additional information.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Thank you for your understanding.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Grievance Rejected");
};
exports.grievanceRejectedEmail = grievanceRejectedEmail;
// src/services/emailService.ts - Add these new templates
// Business Registration Approved Email
const businessApprovedEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Registration Approved
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                We are pleased to inform you that your ${data.registrationType} registration for 
                <strong>${data.businessName}</strong> has been approved.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Registration Number</p>
                        <p style="font-size: 20px; color: #016630; font-weight: 700; margin: 0; letter-spacing: 1px; font-family: 'Courier New', monospace;">
                            ${data.registrationNumber}
                        </p>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Your certificate will be issued shortly. You will receive a separate email with your certificate details.
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Congratulations on this milestone!
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Registration Approved");
};
exports.businessApprovedEmail = businessApprovedEmail;
// src/services/emailService.ts - Add this new template
// Admin Notification for New Contact Submission
const contactAdminNotificationEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                New Contact Form Submission
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                A new contact form has been submitted on the website.
            </p>
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e4e9;">
                <tr>
                    <td style="padding: 4px 0;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0; font-weight: 500;">Name</p>
                        <p style="font-size: 14px; color: #1F2937; margin: 4px 0 12px 0; font-weight: 600;">
                            ${data.name}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 4px 0;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0; font-weight: 500;">Email</p>
                        <p style="font-size: 14px; color: #1F2937; margin: 4px 0 12px 0;">
                            <a href="mailto:${data.email}" style="color: #016630; text-decoration: underline;">
                                ${data.email}
                            </a>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 4px 0;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0; font-weight: 500;">Phone</p>
                        <p style="font-size: 14px; color: #1F2937; margin: 4px 0 12px 0;">
                            ${data.phone}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 4px 0;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0; font-weight: 500;">Subject</p>
                        <p style="font-size: 14px; color: #1F2937; margin: 4px 0 12px 0; font-weight: 600;">
                            ${data.subject}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 4px 0;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0; font-weight: 500;">Message</p>
                        <p style="font-size: 14px; color: #1F2937; margin: 4px 0 0 0; line-height: 1.6;">
                            ${data.message}
                        </p>
                    </td>
                </tr>
            </table>

            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${process.env.APP_URL || "https://mtiicadmin.devclinton.org"}/admin/contacts" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            View in Admin Dashboard
                        </a>
                    </td>
                </tr>
            </table>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated notification from the website.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "New Contact Form Submission");
};
exports.contactAdminNotificationEmail = contactAdminNotificationEmail;
// src/services/emailService.ts - Add these new templates
// Course Enrollment Confirmation Email
const courseEnrollmentEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Welcome to Your Course!
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Congratulations! You have successfully enrolled in <strong>${data.courseTitle}</strong>.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Enrollment Details</p>
                        <p style="font-size: 14px; color: #1F2937; margin: 4px 0;">
                            <strong>Course:</strong> ${data.courseTitle}
                        </p>
                        <p style="font-size: 14px; color: #1F2937; margin: 4px 0;">
                            <strong>Started:</strong> ${data.startDate}
                        </p>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                You can access the course materials at any time from your learning dashboard.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${process.env.APP_URL || "https://ministry-of-trade-ekiti.onrender.com"}/courses/${data.courseSlug}" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            Start Learning
                        </a>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Course Enrollment Confirmation");
};
exports.courseEnrollmentEmail = courseEnrollmentEmail;
// Course Completion Email
const courseCompletionEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Course Completed!
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Congratulations on completing <strong>${data.courseTitle}</strong>! 
                We are proud of your achievement.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 12px; color: #6B7280; margin: 0 0 4px 0; font-weight: 500;">Certificate ID</p>
                        <p style="font-size: 18px; color: #016630; font-weight: 700; margin: 0; font-family: 'Courier New', monospace;">
                            ${data.certificateId}
                        </p>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Your certificate is ready to download. You can also view it in your learning dashboard.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${data.certificateUrl}" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            Download Certificate
                        </a>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Course Completed");
};
exports.courseCompletionEmail = courseCompletionEmail;
// src/services/emailService.ts - Add this new template
// Course Progress Update Email
const courseProgressEmail = (data) => {
    const content = `
        <div class="form-body" style="font-family: 'Inter', sans-serif;">
            <h2 style="font-size: 22px; color: #016630; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                Course Progress Update
            </h2>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 16px 0; text-align: center;">
                Dear <strong>${data.name}</strong>,
            </p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                You've made great progress in <strong>${data.courseTitle}</strong>!
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid #dcfce7;">
                <tr>
                    <td align="center">
                        <p style="font-size: 48px; font-weight: 700; color: #016630; margin: 0; line-height: 1;">
                            ${data.progress}%
                        </p>
                        <p style="font-size: 14px; color: #6B7280; margin: 4px 0 0 0; font-weight: 500;">
                            Course Complete
                        </p>
                        <div style="width: 100%; height: 8px; background-color: #e5e7eb; border-radius: 4px; margin: 12px 0 0 0; overflow: hidden;">
                            <div style="width: ${data.progress}%; height: 100%; background-color: #016630; border-radius: 4px; transition: width 0.3s ease;"></div>
                        </div>
                    </td>
                </tr>
            </table>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin: 12px 0;">
                Keep up the momentum! You're on your way to completing this course.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="${process.env.APP_URL || "https://mtiic.devclinton.org"}/courses/${data.courseSlug}" 
                           style="background-color: #016630; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                            Continue Learning
                        </a>
                    </td>
                </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p style="font-size: 12px; color: #6B7280; text-align: center; margin: 0;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    `;
    return (0, exports.getBaseTemplate)(content, "Course Progress Update");
};
exports.courseProgressEmail = courseProgressEmail;
//# sourceMappingURL=emailService.js.map