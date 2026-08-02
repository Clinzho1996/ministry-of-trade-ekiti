"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Business_1 = __importDefault(require("../models/Business"));
const Contact_1 = __importDefault(require("../models/Contact"));
const Event_1 = __importDefault(require("../models/Event"));
const News_1 = __importDefault(require("../models/News"));
const Opportunity_1 = __importDefault(require("../models/Opportunity"));
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const getDashboardStats = async (req, res) => {
    try {
        const [businesses, news, events, contacts, users, opportunities] = await Promise.all([
            Business_1.default.countDocuments(),
            News_1.default.countDocuments(),
            Event_1.default.countDocuments(),
            Contact_1.default.countDocuments(),
            User_1.default.countDocuments(),
            Opportunity_1.default.countDocuments(),
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
    }
    catch (error) {
        logger_1.default.error("Get dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics.",
        });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=statsController.js.map