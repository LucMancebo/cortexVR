import express from "express";
import http from "http";

export function createServer() {
  const app = express();

  app.get("/health", (_, res) => {
    res.json({ ok: true });
  });

  const server = http.createServer(app);
  return server;
}
