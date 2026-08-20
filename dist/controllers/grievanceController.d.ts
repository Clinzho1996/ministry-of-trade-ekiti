import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const submitGrievance: (req: AuthRequest, res: Response) => Promise<void>;
export declare const trackGrievance: (req: Request, res: Response) => Promise<void>;
export declare const getAllGrievances: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getGrievanceById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateGrievanceStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteGrievance: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getGrievanceStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=grievanceController.d.ts.map