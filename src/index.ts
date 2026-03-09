import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import dns from "dns";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authLimiter, globalLimiter } from "./middlewares/rateLimiter.js";
import profilesRoutes from "./routes/profiles.routes.js";
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(globalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/profiles", profilesRoutes);
app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});
app.use(errorHandler);
const start = async (): Promise<void> => {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
export default app;
