export type WSMessage =
  | {
      type: "stat";
      ip: string;
      level: number;
    }
  | {
      type: "clients";
      count: number;
    };
