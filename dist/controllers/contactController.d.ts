import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const submitContact: (req: Request, res: Response) => Promise<void>;
export declare const getContacts: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getContact: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateContactStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteContact: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=contactController.d.ts.map