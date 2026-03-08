import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, _response: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }
    next();
  };
};
