import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
export declare const getAllCertificates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCertificateById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const downloadCertificate: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserCertificates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const generateCertificate: (req: AuthRequest, res: Response) => Promise<void>;
export declare const revokeCertificate: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=certificateController.d.ts.map