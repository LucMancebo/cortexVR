import { WSAction } from "../../../shared/wsProtocol"; // Importar WSAction

export interface DeviceState {
  level?: number;
  online: boolean;
  lastSeen: number;
  role: "controller" | "screen";
}

export interface AppState {
  videos: string[];
  selectedVideo: string | null;
  currentVideoAction: WSAction | null; // Adicionado para sincronização de vídeo
  currentVideoTime: number; // Adicionado para sincronização de vídeo
}

export const state: AppState = {
  videos: [],
  selectedVideo: null,
  currentVideoAction: null, // Inicializa com null
  currentVideoTime: 0, // Inicializa com 0
};

export function setVideos(videos: string[]) {
  state.videos = videos;
  const demoVideo = videos.find((v) => v.toLowerCase().includes("demo"));
  state.selectedVideo = demoVideo || videos[0] || null;
}

export function setSelectedVideo(videoName: string | null) {
  state.selectedVideo = videoName;
}

// Nova função para definir o estado do vídeo
export function setVideoState(action: WSAction | null, currentTime: number) {
  state.currentVideoAction = action;
  state.currentVideoTime = currentTime;
}
