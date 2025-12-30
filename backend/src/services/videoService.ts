import fs from "fs/promises";
import path from "path";
import { videoStore, VideoInfo } from "../state/videoStore";


class VideoService {
  private videosDir = path.join(__dirname, '../../frontend/public/videos');

  async save(file: Express.Multer.File): Promise<VideoInfo> {
    const videoId = path.parse(file.filename).name;
    const finalPath = path.join(this.videosDir, file.filename);

    try {
      // Só move se o Multer não gravou direto no destino
      if (file.path !== finalPath) {
        await fs.rename(file.path, finalPath);
      }

      const video: VideoInfo = {
        id: videoId,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: Date.now(),
        path: finalPath,
      };

      videoStore.add(video);
      console.log(`✅ Vídeo salvo: ${video.originalName} (${videoId})`);

      return video;
    } catch (error) {
      console.error("❌ Erro ao salvar vídeo:", error);
      throw new Error("Falha ao salvar vídeo");
    }
  }

  async delete(videoId: string): Promise<boolean> {
    const video = videoStore.get(videoId);
    if (!video) {
      console.warn(`⚠️ Vídeo não encontrado: ${videoId}`);
      return false;
    }

    try {
      await fs.unlink(video.path);
      videoStore.remove(videoId);
      console.log(`🗑️ Vídeo deletado: ${video.originalName}`);
      return true;
    } catch (error) {
      console.error("❌ Erro ao deletar vídeo:", error);
      return false;
    }
  }

  list(): VideoInfo[] {
    return videoStore.all();
  }

  get(videoId: string): VideoInfo | undefined {
    return videoStore.get(videoId);
  }

  exists(videoId: string): boolean {
    return videoStore.exists(videoId);
  }

  getStats() {
    return {
      count: videoStore.count(),
      totalSize: videoStore.getTotalSize(),
      totalSizeMB: videoStore.getTotalSizeMB(),
    };
  }
}

export const videoService = new VideoService();
