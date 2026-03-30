import { LoginInput, RegisterInput } from "../validations/auth.validation.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import {
  buildUserResponse,
  verifyRefreshToken,
} from "../helpers/auth.helpers.js";
import { hashToken } from "../utils/hashToken.js";

export const register = async (data: RegisterInput) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError("Email already in use", 409);

  const user = await User.create(data);
  const refreshToken = generateRefreshToken(user._id.toString());
  const accessToken = generateAccessToken(user._id.toString(), user.role);

  user.refreshToken = await hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return {
    accessToken,
    refreshToken,
    user: buildUserResponse(user),
  };
};
export const login = async (data: LoginInput) => {
  const user = await User.findOne({ email: data.email }).select(
    "+password +refreshToken",
  );
  if (!user) throw new AppError("Invalid credentials", 401);
  const isValid = await user.comparePassword(data.password);
  if (!isValid) throw new AppError("Invalid credentials", 401);
  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());
  user.refreshToken = await hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  return {
    accessToken,
    refreshToken,
    user: buildUserResponse(user),
  };
};

export const refreshToken = async (token: string) => {
  if (!token) throw new AppError("No Refresh Token provided", 401);

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || !user.refreshToken)
    throw new AppError("Invalid Refresh token", 401);

  const isMatch = await bcrypt.compare(token, user.refreshToken);

  if (!isMatch) throw new AppError("Invalid Refresh token", 401);

  const newAccessToken = generateAccessToken(user._id.toString(), user.role);
  const newRefreshToken = generateRefreshToken(user._id.toString());

  const hashedNewRefreshToken = await hashToken(newRefreshToken);

  user.refreshToken = hashedNewRefreshToken;

  await user.save({ validateBeforeSave: false });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (token: string) => {
  if (!token) throw new AppError("No Token found", 401);

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || !user.refreshToken)
    throw new AppError("Invalid Refresh token", 401);
  const isMatch = await bcrypt.compare(token, user.refreshToken);
  if (!isMatch) throw new AppError("Invalid Refresh token", 401);
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });
};
