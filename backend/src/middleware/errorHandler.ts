import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  code?: number | string;
  keyValue?: Record<string, unknown>;
  errors?: Record<
    string,
    {
      message: string;
    }
  >;
}

const errorHandler = (err: AppError,req: Request,res: Response,next: NextFunction
) => {
  let statusCode = err.statusCode ?? 500;
  let message = err.message || "Server Error";
  console.log( 'from handler >',err)
  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size exceeds the maximum limit of 10MB";
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    message = "Token expired";
    statusCode = 401;
  }

  console.error("Error:", {
    originalMessage: err.message,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
