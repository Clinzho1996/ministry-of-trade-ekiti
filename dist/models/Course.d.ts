import mongoose, { Document } from "mongoose";
export interface ICourse extends Document {
    title: string;
    description: string;
    category: string;
    level: "beginner" | "intermediate" | "advanced";
    image: string;
    imagePublicId?: string;
    instructor: string;
    instructorBio?: string;
    duration: string;
    lessons: number;
    students: number;
    rating: number;
    price: number;
    isFree: boolean;
    isPublished: boolean;
    featured: boolean;
    slug: string;
    content: string;
    prerequisites: string[];
    learningObjectives: string[];
    tags: string[];
    videoUrl?: string;
    videoType: "youtube" | "vimeo" | "upload";
    externalUrl?: string;
    completionCertificate: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICourse, {}, {}, {}, mongoose.Document<unknown, {}, ICourse, {}, mongoose.DefaultSchemaOptions> & ICourse & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICourse>;
export default _default;
//# sourceMappingURL=Course.d.ts.map