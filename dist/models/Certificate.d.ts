import mongoose, { Document } from "mongoose";
export interface ICertificate extends Document {
    userId: string;
    userEmail: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    certificateId: string;
    completionDate: Date;
    certificateUrl: string;
    issued: boolean;
    issuedAt: Date;
}
declare const _default: mongoose.Model<ICertificate, {}, {}, {}, mongoose.Document<unknown, {}, ICertificate, {}, mongoose.DefaultSchemaOptions> & ICertificate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICertificate>;
export default _default;
//# sourceMappingURL=Certificate.d.ts.map