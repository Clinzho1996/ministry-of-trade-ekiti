import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getAllEnrollments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getEnrollmentById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserEnrollments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateEnrollmentStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteEnrollment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getEnrollmentStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=enrollmentController.d.ts.map