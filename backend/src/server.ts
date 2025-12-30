import express from "express";
import http from "http";
import path from "path";
import fs from "fs";

export function createServer() {
  const app = express();

  app.post("/upload", async (req, res) => {
    return res.json({
      erro: false,
      message: "Upload recebido com sucesso"
    });
  });


  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Servir frontend build
  app.use(express.static("../frontend/public/videos"));

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
