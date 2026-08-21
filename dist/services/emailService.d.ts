export declare const getBaseTemplate: (content: string, title: string) => string;
export declare const sendEmail: ({ to, subject, html, }: {
    to: string | string[];
    subject: string;
    html: string;
}) => Promise<import("resend").CreateEmailResponse>;
export declare const grievanceAcknowledgmentEmail: (data: {
    name: string;
    trackingId: string;
    email: string;
}) => string;
export declare const grievanceResolvedEmail: (data: {
    name: string;
    trackingId: string;
    resolution: string;
}) => string;
export declare const contactConfirmationEmail: (data: {
    name: string;
    email: string;
    subject: string;
}) => string;
export declare const businessRegistrationEmail: (data: {
    name: string;
    businessName: string;
    registrationNumber: string;
    registrationType: string;
}) => string;
export declare const certificateIssuedEmail: (data: {
    name: string;
    businessName: string;
    certificateId: string;
    certificateUrl: string;
}) => string;
export declare const grievanceStatusUpdateEmail: (data: {
    name: string;
    trackingId: string;
    status: string;
    message: string;
}) => string;
export declare const grievanceRejectedEmail: (data: {
    name: string;
    trackingId: string;
    reason: string;
}) => string;
export declare const businessApprovedEmail: (data: {
    name: string;
    businessName: string;
    registrationNumber: string;
    registrationType: string;
}) => string;
export declare const contactAdminNotificationEmail: (data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}) => string;
export declare const courseEnrollmentEmail: (data: {
    name: string;
    courseTitle: string;
    courseSlug: string;
    startDate: string;
}) => string;
export declare const courseCompletionEmail: (data: {
    name: string;
    courseTitle: string;
    certificateId: string;
    certificateUrl: string;
}) => string;
export declare const courseProgressEmail: (data: {
    name: string;
    courseTitle: string;
    progress: number;
    courseSlug: string;
}) => string;
//# sourceMappingURL=emailService.d.ts.map