import { WebSocket } from "ws";

export interface Device {
  id: string;
  ws: WebSocket;
  online: boolean;
  lastSeen: number;
  battery?: number;
}

class DeviceStore {
  private devices = new Map<string, Device>();

  add(device: Device) {
    this.devices.set(device.id, device);
  }

  remove(id: string) {
    this.devices.delete(id);
  }

  get(id: string) {
    return this.devices.get(id);
  }

  all() {
    return Array.from(this.devices.values());
  }

  count() {
    return this.devices.size;
  }
}

export const deviceStore = new DeviceStore();
