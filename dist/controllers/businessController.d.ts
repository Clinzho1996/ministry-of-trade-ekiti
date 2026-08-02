import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getBusinesses: (req: Request, res: Response) => Promise<void>;
export declare const getBusinessBySlug: (req: Request, res: Response) => Promise<void>;
export declare const getBusiness: (req: Request, res: Response) => Promise<void>;
export declare const createBusiness: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBusiness: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBusiness: (req: AuthRequest, res: Response) => Promise<void>;
export declare const uploadBusinessImages: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBusinessImage: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBusinessCategories: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=businessController.d.ts.map