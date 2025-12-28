export interface DeviceState {
  level?: number;
  online: boolean;
  lastSeen: number;
  role: "controller" | "screen";
}



export const devices: Record<string, DeviceState> = {};