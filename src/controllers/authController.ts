import { NextFunction, Request, Response } from "express";
import * as authService from "../services/authService.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../utils/cookie.utils.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken, refreshToken, user } = await authService.register(
      req.body,
    );
    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({ success: true, data: { accessToken, user } });
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
    const { accessToken, refreshToken, user } = await authService.login(
      req.body,
    );
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { accessToken, user } });
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
    const { accessToken, refreshToken } = await authService.refreshToken(token);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { accessToken } });
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
    await authService.logout(token);
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
