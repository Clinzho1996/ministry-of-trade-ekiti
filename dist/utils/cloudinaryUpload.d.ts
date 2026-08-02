export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
}
export declare const uploadToCloudinary: (fileBuffer: Buffer, folder: string, fileName?: string) => Promise<CloudinaryUploadResult>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
//# sourceMappingURL=cloudinaryUpload.d.ts.map