import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCurrentUserProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleUserStatus: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map