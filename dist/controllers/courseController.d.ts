import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getCourses: (req: Request, res: Response) => Promise<void>;
export declare const getCourseBySlug: (req: Request, res: Response) => Promise<void>;
export declare const createCourse: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateCourse: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteCourse: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCourseEnrollments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProgress: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserCertificates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const enrollUser: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=courseController.d.ts.map