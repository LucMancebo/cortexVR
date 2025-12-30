// backend/src/state/videoStore.ts
import { WSAction } from "../../../shared/wsProtocol";

export interface VideoInfo {
  id: string;
  filename: string;        // nome do arquivo salvo (uuid.mp4)
  originalName: string;    // nome original do upload
  size: number;           // tamanho em bytes
  mimetype: string;       // video/mp4, etc
  uploadedAt: number;     // timestamp
  path: string;           // caminho completo do arquivo
}

class VideoStore {
  private videos = new Map<string, VideoInfo>();

  // Estado global do vídeo em reprodução
  private currentPlayingVideoId: string | null = null;
  private currentPlaybackAction: WSAction | null = null;
  private currentPlaybackTime: number = 0;

  /* ========== CRUD básico ========== */
  add(video: VideoInfo) {
    this.videos.set(video.id, video);
  }

  remove(id: string): boolean {
    // Se o vídeo removido for o que está tocando, resetar o estado
    if (this.currentPlayingVideoId === id) {
      this.resetPlaybackState();
    }
    return this.videos.delete(id);
  }

  get(id: string): VideoInfo | undefined {
    return this.videos.get(id);
  }

  all(): VideoInfo[] {
    return Array.from(this.videos.values());
  }

  exists(id: string): boolean {
    return this.videos.has(id);
  }

  count(): number {
    return this.videos.size;
  }

  /* ========== Busca ========== */
  findByFilename(filename: string): VideoInfo | undefined {
    return this.all().find(v => v.filename === filename);
  }

  /* ========== Stats ========== */
  getTotalSize(): number {
    return this.all().reduce((sum, v) => sum + v.size, 0);
  }

  getTotalSizeMB(): string {
    return (this.getTotalSize() / (1024 * 1024)).toFixed(2);
  }

  /* ========== Métodos para o estado de reprodução ========== */
  setPlaybackState(
    videoId: string | null,
    action: WSAction | null,
    time: number
  ) {
    this.currentPlayingVideoId = videoId;
    this.currentPlaybackAction = action;
    this.currentPlaybackTime = time;
  }

  getPlaybackState() {
    return {
      videoId: this.currentPlayingVideoId,
      action: this.currentPlaybackAction,
      currentTime: this.currentPlaybackTime,
    };
  }

  resetPlaybackState() {
    this.currentPlayingVideoId = null;
    this.currentPlaybackAction = null;
    this.currentPlaybackTime = 0;
  }
}

export const videoStore = new VideoStore();