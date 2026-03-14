import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { UserRole } from "../types/enum.js";

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: Request, _response: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }
    next();
  };
};
