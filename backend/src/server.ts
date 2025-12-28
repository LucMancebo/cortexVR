import express from "express";
import http from "http";
import path from "path";

export function createServer() {
  const app = express();

  // servir tudo que está em frontend/dist (inclui index.html e assets)
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  // rota raiz -> index.html
  app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });

  const server = http.createServer(app);
  return server;
}
