import mongoose, { Document } from 'mongoose';
export interface IGallery extends Document {
    title: string;
    category: 'Past' | 'Upcoming';
    date: Date;
    image: string;
    imagePublicId?: string;
    description?: string;
    isPublished: boolean;
}
declare const _default: mongoose.Model<IGallery, {}, {}, {}, mongoose.Document<unknown, {}, IGallery, {}, mongoose.DefaultSchemaOptions> & IGallery & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IGallery>;
export default _default;
//# sourceMappingURL=Gallery.d.ts.map