export interface DeviceState {
  level: number;     // bateria
  lastSeen: number;  // última mensagem recebida
  online: boolean;   // status atual
}

export const devices: Record<string, DeviceState> = {};
