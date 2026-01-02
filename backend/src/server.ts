import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import videosRouter from "./routes/video";
import uploadRouter from "./routes/upload";
import registerUploadRouter from "./routes/registerUpload";
import { videoService } from "./services/videoService";
import { deviceStore } from "./state/deviceStore";
import { WSOutbound } from "../../shared/wsProtocol";

export function createServer() {
  const app = express();
  
  // Registra rotas separadas
  app.use(uploadRouter);
  app.use(registerUploadRouter);
  app.use(videosRouter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // already registered above

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Rota de debug para listar rotas registradas (útil para diagnosticar 404s)
  app.get('/api/debug/routes', (_req, res) => {
    try {
      // @ts-ignore
      const routes = app._router.stack
        // filter layers with route info
        .filter((layer: any) => layer.route)
        .map((layer: any) => {
          const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
          return `${methods} ${layer.route.path}`;
        });
      res.json({ routes });
    } catch (err) {
      res.status(500).json({ error: 'failed to list routes', detail: String(err) });
    }
  });

  // Servir vídeos estáticos (pasta frontend/public/videos)
  app.use("/videos", express.static(path.join(__dirname, "../../frontend/public/videos")));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // SPA fallback
  app.use("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/videos/")) {
      return next();
    }
    res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
  });

  // 404 para API
  app.use("/api/*", (req, res) => {
    res
      .status(404)
      .json({ success: false, error: "Rota de API não encontrada" });
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
