import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/api/videos", (req, res) => {
  const videosDir = path.join(__dirname, "../../frontend/public/videos");

  fs.readdir(videosDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao listar vídeos" });
    }

    // Filtra apenas arquivos de vídeo
    const videoFiles = files.filter((f) => f.match(/\.(mp4|webm|ogg)$/i));

    const videos = videoFiles.map((filename) => {
      const id = path.parse(filename).name;
      let size = 0;
      let uploadedAt = Date.now();
      try {
        const stats = fs.statSync(path.join(videosDir, filename));
        size = stats.size;
        uploadedAt = stats.mtimeMs || stats.ctimeMs || Date.now();
      } catch (e) {
        // ignore
      }

      return {
        id,
        filename,
        originalName: filename,
        size,
        uploadedAt,
        path: `/videos/${filename}`,
        url: `/videos/${filename}`,
      };
    });

    // Retorna no formato { videos: [...] } para consistência com frontend/ws
    res.json({ videos });
  });
});

export default router;
