import { Response } from "express";
import { LoginInput, RegisterInput } from "../validations/auth.validation.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../utils/cookie.utils.js";
import {
  builUserResponse,
  verifyRefreshToken,
} from "../helpers/auth.helpers.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
export const register = async (data: RegisterInput, res: Response) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError("Email already in use", 409);

  const user = await User.create(data);
  const refreshToken = generateRefreshToken(user._id.toString());
  const accessToken = generateAccessToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  setRefreshTokenCookie(res, refreshToken);
  return {
    accessToken,
    user: builUserResponse(user),
  };
};
export const login = async (data: LoginInput, res: Response) => {
  const user = await User.findOne({ email: data.email }).select(
    "+password +refreshToken",
  );
  if (!user) throw new AppError("Invalid credentials", 401);
  const isValid = await user.comparePassword(data.password);
  if (!isValid) throw new AppError("Invalid credentials", 401);
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  setRefreshTokenCookie(res, refreshToken);
  return {
    accessToken,
    user: builUserResponse(user),
  };
};

export const refreshToken = async (token: string, res: Response) => {
  if (!token) throw new AppError("No Refresh Token provided", 401);
  verifyRefreshToken(token);
  const user = await User.findOne({ refreshToken: token });
  if (!user) throw new AppError("Invalid Refresh token", 401);

  const newAccessToken = generateAccessToken(user.id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });
  setRefreshTokenCookie(res, newRefreshToken);
  return { accessToken: newAccessToken };
};

export const logout = async (token: string, res: Response) => {
  if (!token) throw new AppError("No Token found", 401);
  await User.findOneAndUpdate({ refreshToken: token }, { refreshToken: null });
  clearRefreshTokenCookie(res);
  return { message: "Logged out Succesfully" };
};
