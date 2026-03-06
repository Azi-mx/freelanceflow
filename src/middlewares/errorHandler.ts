// Global error handling middleware
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unknown/unexpected error
  console.error("Unexpected error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
};
