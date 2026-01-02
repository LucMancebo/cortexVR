import express from "express";
import path from "path";
import fs from "fs/promises";
import { videoStore, VideoInfo } from "../state/videoStore";
import { deviceStore } from "../state/deviceStore";
import { WSOutbound } from "../../../shared/wsProtocol";

const router = express.Router();

// Recebe notificacao do serviço externo (python) com payload { file: { filename, path, url, originalName?, size? } }
router.post("/api/register-upload", express.json(), async (req, res) => {
  try {
    const payload = req.body?.file;
    if (!payload || !payload.filename) {
      return res.status(400).json({ error: "payload inválido" });
    }

    const filename: string = payload.filename;
    const videosDir = path.join(__dirname, "../../frontend/public/videos");
    const filePath = path.join(videosDir, filename);

    // tenta obter stats se size não enviado
    let size = payload.size ?? 0;
    let uploadedAt = payload.uploadedAt ?? Date.now();
    try {
      const st = await fs.stat(filePath);
      size = st.size;
      uploadedAt = Math.floor(st.mtimeMs || Date.now());
    } catch (e) {
      // se não existe no FS, ainda assim registramos, mas aviso
      console.warn("Arquivo não encontrado ao registrar upload:", filePath);
    }

    const id = path.parse(filename).name;
    const video: VideoInfo = {
      id,
      filename,
      originalName: payload.originalName ?? filename,
      size,
      mimetype: payload.mimetype ?? "video/mp4",
      uploadedAt,
      path: filePath,
    };

    videoStore.add(video);

    const msg: WSOutbound = {
      type: "video-uploaded",
      video: {
        id: video.id,
        filename: video.filename,
        originalName: video.originalName,
        size: video.size,
        uploadedAt: video.uploadedAt,
      },
    };

    try {
      deviceStore.broadcast(msg);
    } catch (e) {
      console.warn("Falha ao broadcast ao registrar upload:", e);
    }

    return res.json({ success: true, video });
  } catch (err) {
    console.error("Erro em /api/register-upload:", err);
    return res.status(500).json({ error: "erro interno" });
  }
});

export default router;
