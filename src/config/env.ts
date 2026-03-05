import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
] as const;

// Fail fast — if any required env var is missing, crash immediately
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: process.env["PORT"] ?? "5000",
  mongoUri: process.env["MONGO_URI"] as string,
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  jwt: {
    accessSecret: process.env["JWT_ACCESS_SECRET"] as string,
    refreshSecret: process.env["JWT_REFRESH_SECRET"] as string,
    accessExpiresIn: process.env["JWT_ACCESS_EXPIRES_IN"] ?? "15m",
    refreshExpiresIn: process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d",
  },
} as const;
