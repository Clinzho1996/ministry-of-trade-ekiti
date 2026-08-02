import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<IActivityLog, {}, {}, {}, mongoose.Document<unknown, {}, IActivityLog, {}, mongoose.DefaultSchemaOptions> & IActivityLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IActivityLog>;
export default _default;
//# sourceMappingURL=ActivityLog.d.ts.map