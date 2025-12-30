// backend/src/config/paths.ts
import path from "path";

export const ROOT_DIR = process.cwd(); // raiz do projeto
export const VIDEOS_DIR = path.resolve(ROOT_DIR, "videos");
export const FRONTEND_DIST_DIR = path.resolve(ROOT_DIR, "frontend", "dist");
export const FRONTEND_PUBLIC_VIDEOS_DIR = path.resolve(ROOT_DIR, "frontend", "public", "videos");
