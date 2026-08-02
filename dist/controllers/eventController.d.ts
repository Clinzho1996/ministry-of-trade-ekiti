import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getEvents: (req: Request, res: Response) => Promise<void>;
export declare const getEventBySlug: (req: Request, res: Response) => Promise<void>;
export declare const createEvent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateEvent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteEvent: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=eventController.d.ts.map