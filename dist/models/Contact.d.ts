import mongoose, { Document } from 'mongoose';
export interface IContact extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'pending' | 'read' | 'replied' | 'archived';
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
}
declare const _default: mongoose.Model<IContact, {}, {}, {}, mongoose.Document<unknown, {}, IContact, {}, mongoose.DefaultSchemaOptions> & IContact & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IContact>;
export default _default;
//# sourceMappingURL=Contact.d.ts.map