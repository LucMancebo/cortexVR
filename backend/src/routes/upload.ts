import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { videoService } from "../services/videoService";
import { deviceStore } from "../state/deviceStore";
import { WSOutbound } from "../../../shared/wsProtocol";

const router = express.Router();

// Pasta temporária para uploads
const tmpUploads = path.join(__dirname, "../../tmp/uploads");
if (!fs.existsSync(tmpUploads)) {
  fs.mkdirSync(tmpUploads, { recursive: true });
}

// Limites e filtro (aceita tipos de vídeo)
const MAX_UPLOAD_BYTES = process.env.MAX_UPLOAD_BYTES
  ? parseInt(process.env.MAX_UPLOAD_BYTES)
  : 500 * 1024 * 1024; // 500 MB por padrão

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tmpUploads),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

function videoFileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype && file.mimetype.startsWith("video/")) return cb(null, true);
  // allow common extensions as fallback
  if (file.originalname.match(/\.(mp4|webm|ogg|mov|mkv)$/i)) return cb(null, true);
  return cb(new Error("Tipo de arquivo não suportado. Envie um vídeo."));
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: videoFileFilter,
});

// POST /api/upload
router.post("/api/upload", upload.single("video"), async (req, res, next) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    const saved = await videoService.save(file);

    const fileInfo = {
      id: saved.id,
      filename: saved.filename,
      path: `/videos/${saved.filename}`,
      url: `/videos/${saved.filename}`,
    };

    const msg: WSOutbound = {
      type: "video-uploaded",
      video: {
        id: saved.id,
        filename: saved.filename,
        originalName: saved.originalName,
        size: saved.size,
        uploadedAt: saved.uploadedAt,
      },
    };

    try {
      deviceStore.broadcast(msg);
    } catch (e) {
      console.warn("⚠️ Falha ao broadcast do evento video-uploaded:", e);
    }

    return res.json({ file: fileInfo });
  } catch (err) {
    // Multer errors come through as a MulterError, but we handle generically
    if ((err as any).code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Arquivo muito grande" });
    }
    return next(err);
  }
});

export default router;
