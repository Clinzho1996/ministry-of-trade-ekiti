import mongoose, { Document } from "mongoose";
export interface IGrievance extends Document {
    trackingId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    grievanceType: string;
    priority: string;
    incidentDate?: Date;
    description: string;
    expectedResolution?: string;
    status: "pending" | "in-review" | "resolved" | "rejected";
    resolution?: string;
    resolvedBy?: string;
    resolvedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
}
declare const _default: mongoose.Model<IGrievance, {}, {}, {}, mongoose.Document<unknown, {}, IGrievance, {}, mongoose.DefaultSchemaOptions> & IGrievance & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGrievance>;
export default _default;
//# sourceMappingURL=Grievance.d.ts.map