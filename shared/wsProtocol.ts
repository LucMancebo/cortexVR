// src/shared/wsProtocol.ts

export type WSRole = "controller" | "screen";

/* CLIENTE → SERVIDOR */
export type WSInbound =
  | { type: "hello"; deviceId: string; role: WSRole }
  | {
    role: string; type: "battery"; deviceId: string; level: number 
}
  | { type: "load"; deviceId: string; video: string }
  | { type: "action"; deviceId: string; action: WSAction };

export type WSAction = "play" | "pause" | "stop";

/* SERVIDOR → CLIENTE */
export type WSOutbound =
  | { type: "clients"; count: number }
  | { type: "stat"; deviceId: string; level: number; role: WSRole }
  | { type: "load"; video: string }
  | { type: "action"; action: WSAction }
  | {
      type: "snapshot";
      devices: {
        id: string;
        role: WSRole;
        battery: number;
        online: boolean;
        lastSeen: number;
      }[];
      clients: number;
    };
