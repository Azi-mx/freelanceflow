import { NextFunction, Request, Response } from "express";
import * as authService from "../services/authService.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data, res);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data, res);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken as string;
    const result = await authService.refreshToken(token, res);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken as string;
    await authService.logout(token, res);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
