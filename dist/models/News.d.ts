import mongoose, { Document } from "mongoose";
export interface INews extends Document {
    category: string;
    date: Date;
    title: string;
    description: string;
    content: string;
    image: string;
    imagePublicId?: string;
    slug: string;
    isPublished: boolean;
    featured: boolean;
    views: number;
}
declare const _default: mongoose.Model<INews, {}, {}, {}, mongoose.Document<unknown, {}, INews, {}, mongoose.DefaultSchemaOptions> & INews & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INews>;
export default _default;
//# sourceMappingURL=News.d.ts.map