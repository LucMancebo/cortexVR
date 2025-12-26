// Mensagens que o CLIENTE pode enviar
export type WSInbound =
  | {
      type: "battery";
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

// Mensagens que o SERVIDOR envia
export type WSOutbound =
  | {
      type: "stat";
      ip: string;
      level: number;
    }
  | {
      type: "clients";
      count: number;
    }
  | {
      type: "load";
      video: string;
    }
  | {
      type: "action";
      action: "play" | "pause" | "stop";
    };
