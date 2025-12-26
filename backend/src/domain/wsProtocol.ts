// --------------------
// CLIENT → SERVER
// --------------------

export type WSInbound =
  | {
      type: "hello";
      role: "panel" | "device";
      deviceId: string;
    }
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

// --------------------
// SERVER → CLIENT
// --------------------

export type WSOutbound =
  | {
      type: "clients";
      total: number;
    }
  | {
      type: "stat";
      deviceId: string;
      level: number;
      online: boolean;
    }
  | {
      type: "load";
      video: string;
    }
  | {
      type: "action";
      action: "play" | "pause" | "stop";
    };
