// src/index.ts
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

import { apiLimiter } from "./middleware/rateLimiter";
import { handleUploadError } from "./middleware/upload";
// src/index.ts
import cors from "cors";

// Load environment variables
dotenv.config();

// Allow multiple origins
const allowedOrigins = [
	"https://mtiicadmin.devclinton.org",
	"https://ministry-of-trade-ekiti.onrender.com",
	"http://localhost:3000",
	"http://localhost:3001",
];

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	morgan("combined", {
		stream: {
			write: (message: string) => logger.info(message.trim()),
		},
	}),
);

app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);

			if (allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	}),
);

// Global rate limiter
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/businesses", businessRoutes);

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
