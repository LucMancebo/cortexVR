import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { FRONTEND_PUBLIC_VIDEOS_DIR, ROOT_DIR } from "../config/paths";

const router = Router();

// Rota para listar os vídeos disponíveis
router.get("/", async (req, res, next) => {
  try {
    const files = await fs.readdir(FRONTEND_PUBLIC_VIDEOS_DIR);
    const videoFiles = files
      .filter((file) => file.endsWith(".mp4") || file.endsWith(".webm") || file.endsWith(".ogg"))
      .map((file) => `/videos/${file}`); // Return paths relative to frontend's public/videos
    res.json({ videos: videoFiles });
  } catch (error) {
    console.error("❌ Erro ao listar vídeos:", error);
    next(error);
  }
});

export default router;