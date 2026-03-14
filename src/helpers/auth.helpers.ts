import { verify } from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { ITokenPayload } from "../types/auth.types.js";

export const verifyRefreshToken = (token: string): ITokenPayload => {
  try {
    const decoded = verify(token, config.jwt.refreshSecret) as ITokenPayload;
    return decoded;
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }
};

export const buildUserResponse = (user: InstanceType<typeof User>) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
  };
};
