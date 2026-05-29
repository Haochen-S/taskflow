import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env";
import { errorHandler } from "./middleware/auth";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/task.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", taskRoutes);

  app.use(errorHandler);

  return app;
}
