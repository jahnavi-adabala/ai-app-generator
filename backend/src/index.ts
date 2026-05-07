import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";
import appRoutes from "./routes/apps.routes";
import notificationRoutes from "./routes/notifications.routes";
import { errorHandler } from "./middleware/error-handler";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: true
  })
);
app.use(express.json({ limit: "5mb" }));

app.get("/", (_req, res) => {
  res.json({
    service: "AI App Generator API",
    status: "running",
    frontend: process.env.FRONTEND_URL || "http://localhost:3000",
    health: "/health",
    api: ["/api/auth", "/api/apps", "/api/notifications"]
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-app-generator-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/apps", appRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
