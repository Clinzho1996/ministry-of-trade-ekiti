import mongoose, { Document } from "mongoose";
export interface IBusiness extends Document {
    name: string;
    description: string;
    category: string;
    subCategory?: string;
    location: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    logo: string;
    logoPublicId?: string;
    images: string[];
    imagesPublicIds: string[];
    isVerified: boolean;
    isActive: boolean;
    featured: boolean;
    views: number;
    rating: number;
    reviews: number;
    openingHours?: {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
    };
    socialMedia?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
    };
    establishedYear?: number;
    employees?: number;
    slug: string;
}
declare const _default: mongoose.Model<IBusiness, {}, {}, {}, mongoose.Document<unknown, {}, IBusiness, {}, mongoose.DefaultSchemaOptions> & IBusiness & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBusiness>;
export default _default;
//# sourceMappingURL=Business.d.ts.map