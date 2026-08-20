import mongoose, { Document } from "mongoose";
export interface IEnrollment extends Document {
    userId: string;
    userEmail: string;
    userName?: string;
    courseId: string;
    progress: number;
    completedLessons: string[];
    status: "active" | "completed" | "dropped";
    startedAt: Date;
    completedAt?: Date;
    certificateIssued: boolean;
    certificateUrl?: string;
    lastAccessed: Date;
    rating?: number;
    review?: string;
}
declare const _default: mongoose.Model<IEnrollment, {}, {}, {}, mongoose.Document<unknown, {}, IEnrollment, {}, mongoose.DefaultSchemaOptions> & IEnrollment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEnrollment>;
export default _default;
//# sourceMappingURL=Enrollment.d.ts.map