// src/index.ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { configureCloudinary } from "./config/cloudinary";
import { connectDatabase } from "./config/database";
import logger from "./utils/logger";

import authRoutes from "./routes/authRoutes";
import businessRoutes from "./routes/businessRoutes";
import contactRoutes from "./routes/contactRoutes";
import eventRoutes from "./routes/eventRoutes";
import galleryRoutes from "./routes/galleryRoutes";
import newsRoutes from "./routes/newsRoutes";
import opportunityRoutes from "./routes/opportunityRoutes";
import uploadRoutes from "./routes/uploadRoutes";

import { apiLimiter } from "./middleware/rateLimiter";
import { handleUploadError } from "./middleware/upload";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============ CORS CONFIGURATION - MUST BE FIRST ============
const allowedOrigins = [
	"https://mtiicadmin.devclinton.org",
	"https://ministry-of-trade-ekiti.onrender.com",
	"http://localhost:3000",
	"http://localhost:3001",
];

// CORS options
const corsOptions = {
	origin: function (
		origin: string | undefined,
		callback: (err: Error | null, allow?: boolean) => void,
	) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			console.log("Blocked origin:", origin); // Debug log
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
		"Access-Control-Allow-Origin",
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Methods",
	],
	exposedHeaders: ["Content-Length", "X-Requested-With"],
	optionsSuccessStatus: 200, // For legacy browser support
};

// Apply CORS middleware FIRST
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// ============ OTHER MIDDLEWARE ============
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	}),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	morgan("combined", {
		stream: {
			write: (message: string) => logger.info(message.trim()),
		},
	}),
);

// Global rate limiter
app.use("/api", apiLimiter);

// ============ ROUTES ============
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Error handling middleware
app.use(handleUploadError);
app.use((err: any, req: any, res: any, next: any) => {
	logger.error("Unhandled error:", err);
	res.status(500).json({
		success: false,
		message: "Something went wrong. Please try again.",
	});
});

// Start server
const startServer = async () => {
	try {
		await connectDatabase();
		configureCloudinary();

		app.listen(PORT, () => {
			logger.info(`Server running on port ${PORT}`);
			logger.info(`Health check: http://localhost:${PORT}/health`);
		});
	} catch (error) {
		logger.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();

export default app;
