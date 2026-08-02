"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cloudinary_1 = require("./config/cloudinary");
const database_1 = require("./config/database");
const logger_1 = __importDefault(require("./utils/logger"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const businessRoutes_1 = __importDefault(require("./routes/businessRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const galleryRoutes_1 = __importDefault(require("./routes/galleryRoutes"));
const newsRoutes_1 = __importDefault(require("./routes/newsRoutes"));
const opportunityRoutes_1 = __importDefault(require("./routes/opportunityRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const upload_1 = require("./middleware/upload");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Trust proxy for Render
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
// CORS configuration
const allowedOrigins = [
    "https://mtiicadmin.devclinton.org",
    "https://ministry-of-trade-ekiti.onrender.com",
    "http://localhost:3000",
    "http://localhost:3001",
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
};
// Apply CORS middleware FIRST
app.use((0, cors_1.default)(corsOptions));
// REMOVE this line - it's causing the error:
// app.options("*", cors(corsOptions));
// Other middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: (message) => logger_1.default.info(message.trim()),
    },
}));
// ============ ROUTES (No rate limiting) ============
app.use("/api/auth", authRoutes_1.default);
app.use("/api/opportunities", opportunityRoutes_1.default);
app.use("/api/news", newsRoutes_1.default);
app.use("/api/events", eventRoutes_1.default);
app.use("/api/gallery", galleryRoutes_1.default);
app.use("/api/contacts", contactRoutes_1.default);
app.use("/api/businesses", businessRoutes_1.default);
app.use("/api/upload", uploadRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/stats", statsRoutes_1.default);
// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Error handling middleware
app.use(upload_1.handleUploadError);
app.use((err, req, res, next) => {
    logger_1.default.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again.",
    });
});
// Start server
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        (0, cloudinary_1.configureCloudinary)();
        app.listen(PORT, () => {
            logger_1.default.info(`Server running on port ${PORT}`);
            logger_1.default.info(`Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger_1.default.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map