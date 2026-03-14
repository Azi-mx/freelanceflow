import { Response } from "express";
import { config } from "../config/env.js";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, COOKIE_OPTIONS);
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken");
};
