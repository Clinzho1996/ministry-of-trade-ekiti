import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getOpportunities: (req: Request, res: Response) => Promise<void>;
export declare const getOpportunity: (req: Request, res: Response) => Promise<void>;
export declare const createOpportunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateOpportunity: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteOpportunity: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=opportunityController.d.ts.map