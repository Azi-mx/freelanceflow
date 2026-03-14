// Generates JWT access and refresh tokens
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";
import { config } from "../config/env.js";

export const generateAccessToken = (userId: string, role: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as StringValue,
  };

  return jwt.sign({ id: userId, role }, config.jwt.accessSecret, options);
};
export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as StringValue,
  };
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, options);
};
