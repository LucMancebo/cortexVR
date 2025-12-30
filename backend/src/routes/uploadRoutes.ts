// backend/src/routes/upload.ts
import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configuração do destino dos uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../frontend/public/videos"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Rota POST /api/upload
router.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  res.json({
    file: {
      filename: req.file.filename,
      path: `/videos/${req.file.filename}`,
    },
  });
});

export default router;
