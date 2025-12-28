import { WebSocket } from "ws";

export interface Device {
  id: string; // deviceId único
  ws: WebSocket; // conexão WebSocket
  role: "controller" | "screen"; // tipo de cliente
  online: boolean;
  lastSeen: number;
  battery?: number;
}

class DeviceStore {
  private devices = new Map<string, Device>();

  /* ========== CRUD básico ========== */
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

  /* ========== Contagens ========== */
  // total de devices conectados (central + screens)
  count() {
    return Array.from(this.devices.values()).filter((d) => d.online).length;
  }

  // apenas screens conectados
  countScreens() {
    return Array.from(this.devices.values()).filter(
      (d) => d.role === "screen" && d.online
    ).length;
  }

  /* ========== Atualizações de estado ========== */
  updateBattery(id: string, level: number) {
    const device = this.devices.get(id);
    if (device) {
      device.battery = level;
      device.lastSeen = Date.now();
      device.online = true;
    }
  }

  setOffline(id: string) {
    const device = this.devices.get(id);
    if (device) {
      device.online = false;
    }
  }

  updateLastSeen(id: string) {
    const device = this.devices.get(id);
    if (device) {
      device.lastSeen = Date.now();
      device.online = true;
    }
  }

  /* ========== Snapshot inicial ========== */
  snapshot() {
    return {
      devices: this.all().map((d) => ({
        id: d.id,
        role: d.role,
        battery: d.battery ?? 0,
        online: d.online,
        lastSeen: d.lastSeen,
      })),
      clients: this.count(), // 👈 agora conta todos os devices online
    };
  }

  /* ========== Broadcast ========== */
  broadcast(message: object) {
    const payload = JSON.stringify(message);
    this.devices.forEach((d) => {
      if (d.ws.readyState === d.ws.OPEN) {
        d.ws.send(payload);
      }
    });
  }
}

export const deviceStore = new DeviceStore();
