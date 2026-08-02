import mongoose, { Document } from "mongoose";
export interface IEvent extends Document {
    category: string;
    date: Date;
    location: string;
    title: string;
    description: string;
    content: string;
    image: string;
    imagePublicId?: string;
    slug: string;
    isPublished: boolean;
    featured: boolean;
    capacity?: number;
    registeredCount: number;
    isPast: boolean;
}
declare const _default: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, mongoose.DefaultSchemaOptions> & IEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEvent>;
export default _default;
//# sourceMappingURL=Event.d.ts.map