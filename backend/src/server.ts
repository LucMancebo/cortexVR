import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import uploadRoutes from "./routes/uploadRoutes";
import videoRoutes from "./routes/videoRoutes";
import { VIDEOS_DIR, FRONTEND_DIST_DIR } from "./config/paths";

export function createServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Garante que a pasta de vídeos exista
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });

  // Servir vídeos
  app.use("/videos", express.static(VIDEOS_DIR));

  // Servir frontend build
  app.use(express.static(FRONTEND_DIST_DIR));

  // Rotas de API
  app.use("/upload", uploadRoutes);
  app.use("/api/videos", videoRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // SPA fallback
  app.use("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/videos/")) {
      return next();
    }
    res.sendFile(path.join(FRONTEND_DIST_DIR, "index.html"));
  });

  // 404 para API
  app.use("/api/*", (req, res) => {
    res.status(404).json({ success: false, error: "Rota de API não encontrada" });
  });

  // Error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("❌ Erro:", err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || "Erro interno do servidor",
    });
  });

  const server = http.createServer(app);
  return server;
}
