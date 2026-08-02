import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getNews: (req: Request, res: Response) => Promise<void>;
export declare const getNewsBySlug: (req: Request, res: Response) => Promise<void>;
export declare const createNews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateNews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteNews: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=newsController.d.ts.map