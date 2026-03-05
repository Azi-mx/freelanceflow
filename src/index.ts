import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import { connectDB } from "./config/db";

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get("health", (_req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

const start = async (): Promise<void> => {
  const dns = require("dns");
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
export default app;
