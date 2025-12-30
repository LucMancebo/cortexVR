export type WSRole = "controller" | "screen";
export type WSAction = "play" | "pause" | "stop" | "seek"; // Adicionado 'seek'

/* ========== MENSAGENS DO CLIENTE → SERVIDOR ========== */
export type WSInbound =
  | { type: "hello"; deviceId: string; role: WSRole }
  | { type: "battery"; deviceId: string; level: number }
  | { type: "load"; deviceId: string; video: string }
  | { type: "action"; deviceId: string; action: WSAction }
  | { type: "request-videos" }
  // 👇 Novos para sincronização de vídeo (cliente -> servidor)
  // Consolidado: video-select agora é tratado como uma video-action com um videoId opcional
  | { type: "video-action"; deviceId: string; action: WSAction; currentTime?: number; videoId?: string }
  | { type: "request-video-state"; deviceId: string };

/* ========== MENSAGENS DO SERVIDOR → CLIENTE ========== */
export type WSOutbound =
  | { type: "clients"; count: number }
  | {
      type: "snapshot";
      devices: {
        id: string;
        role: WSRole; // Corrigido de WSRetryPolicy para WSRole
        battery: number;
        online: boolean;
        lastSeen: number;
      }[];
      clients: number;
    }
  | { type: "stat"; deviceId: string; level: number; role: WSRole }
  | { type: "load"; video: string }
  | { type: "action"; action: WSAction }
  | {
      type: "video-uploaded";
      video: {
        id: string;
        filename: string;
        originalName: string;
        size: number;
        uploadedAt: number;
      };
    }
  | { type: "video-deleted"; videoId: string }
  | { type: "video-list";
      videos: {
        id: string;
        filename: string;
        originalName: string;
        size: number;
        uploadedAt: number;
      }[];
    }
  | { type: "video-selected"; videoId: string }
  // 👇 Novos para sincronização de vídeo (servidor -> cliente)
  | { type: "video-state"; videoId: string | null; action: WSAction | null; currentTime: number };
