import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getGalleryItems: (req: Request, res: Response) => Promise<void>;
export declare const createGalleryItem: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteGalleryItem: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=galleryController.d.ts.map