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

import { apiLimiter } from "./middleware/rateLimiter";
import { handleUploadError } from "./middleware/upload";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
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
