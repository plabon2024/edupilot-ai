import cors from "cors";
import express from "express";

import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db";
import errorHandler from "./middleware/errorHandler";
import config from "./config/env";
import { authRoute } from "./routes/authRoutes";
import { documentRoute } from "./routes/documentRoutes";
import {  flashcardRoutes } from "./routes/flashcardRoutes";
import { aiRoutes } from "./routes/aiRoutes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.port || 8000;

(async () => {
  await connectDB();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  // route
  app.use("/api/auth", authRoute);
  // error handler
  app.use("/api/documents", documentRoute);
  // flashcards handler
  app.use("/api/flashcards", flashcardRoutes);
  app.use("/api/ai", aiRoutes);
  // app.use("/api/quizzes",quizes );
  app.use(errorHandler);

  // 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
      statusCode: 404,
    });
  });
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`);
  });
})();

process.on("unhandledRejection", (err: any) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
