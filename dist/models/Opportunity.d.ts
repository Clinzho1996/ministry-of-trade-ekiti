import mongoose, { Document } from 'mongoose';
export interface IOpportunity extends Document {
    title: string;
    description: string;
    range: string;
    image: string;
    imagePublicId?: string;
    link: string;
    sector: string;
    isActive: boolean;
    sortOrder: number;
}
declare const _default: mongoose.Model<IOpportunity, {}, {}, {}, mongoose.Document<unknown, {}, IOpportunity, {}, mongoose.DefaultSchemaOptions> & IOpportunity & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOpportunity>;
export default _default;
//# sourceMappingURL=Opportunity.d.ts.map