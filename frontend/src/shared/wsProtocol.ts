// src/shared/wsProtocol.ts

// Identidade básica de qualquer mensagem
export type WSBase = {
  deviceId: string;
};

// Tipos de dispositivos
export type WSRole = "controller" | "screen";

/* =========================
   CLIENTE → SERVIDOR
========================= */

export type WSInbound =
  | (WSBase & {
      type: "hello";
      role: WSRole;
    })
  | (WSBase & {
      type: "battery";
      level: number;
    })
  | (WSBase & {
      type: "load";
      video: string;
    })
  | (WSBase & {
      type: "action";
      action: "play" | "pause" | "stop";
    });

/* =========================
   SERVIDOR → CLIENTE
========================= */

export type WSOutbound =
  | {
      type: "clients";
      count: number;
    }
  | {
      type: "stat";
      deviceId: string;
      level: number;
    }
  | {
      type: "load";
      video: string;
    }
  | {
      type: "action";
      action: "play" | "pause" | "stop";
    };
