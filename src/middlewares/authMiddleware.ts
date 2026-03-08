import { verify } from "jsonwebtoken";
import { config } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new AppError("Authorization header required", 401);
    const token = authHeader.split(" ")[1];
    if (!token) throw new AppError("Token required", 401);
    const decoded = verify(token, config.jwt.accessSecret) as {
      id: string;
      role: string;
    };
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    next(error);
  }
};
