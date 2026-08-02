"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const cloudinary_1 = require("./config/cloudinary");
const logger_1 = __importDefault(require("./utils/logger"));
const businessRoutes_1 = __importDefault(require("./routes/businessRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const opportunityRoutes_1 = __importDefault(require("./routes/opportunityRoutes"));
const newsRoutes_1 = __importDefault(require("./routes/newsRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const galleryRoutes_1 = __importDefault(require("./routes/galleryRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const upload_1 = require("./middleware/upload");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.default.info(message.trim()),
    },
}));
// Global rate limiter
app.use('/api', rateLimiter_1.apiLimiter);
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/opportunities', opportunityRoutes_1.default);
app.use('/api/news', newsRoutes_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/gallery', galleryRoutes_1.default);
app.use('/api/contacts', contactRoutes_1.default);
app.use('/api/businesses', businessRoutes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Error handling middleware
app.use(upload_1.handleUploadError);
app.use((err, req, res, next) => {
    logger_1.default.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again.',
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
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map