// src/controllers/statsController.ts
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Business from "../models/Business";
import Contact from "../models/Contact";
import Event from "../models/Event";
import News from "../models/News";
import Opportunity from "../models/Opportunity";
import User from "../models/User";
import logger from "../utils/logger";

export const getDashboardStats = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const [businesses, news, events, contacts, users, opportunities] =
			await Promise.all([
				Business.countDocuments(),
				News.countDocuments(),
				Event.countDocuments(),
				Contact.countDocuments(),
				User.countDocuments(),
				Opportunity.countDocuments(),
			]);

		res.status(200).json({
			success: true,
			data: {
				businesses,
				news,
				events,
				contacts,
				users,
				opportunities,
			},
		});
	} catch (error) {
		logger.error("Get dashboard stats error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch dashboard statistics.",
		});
	}
};
