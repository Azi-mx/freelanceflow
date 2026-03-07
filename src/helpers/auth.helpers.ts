import { verify } from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { config } from "../config/env";
import { User } from "../models/User";

export const verifyRefreshToken = async (token: string) => {
  try {
    verify(token, config.jwt.refreshSecret);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }
};

export const builUserResponse = (user: InstanceType<typeof User>) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
  };
};
