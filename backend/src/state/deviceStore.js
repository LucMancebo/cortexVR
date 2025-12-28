"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceStore = void 0;
class DeviceStore {
    constructor() {
        this.devices = new Map();
    }
    /* ========== CRUD básico ========== */
    add(device) {
        this.devices.set(device.id, device);
    }
    remove(id) {
        this.devices.delete(id);
    }
    get(id) {
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
        return Array.from(this.devices.values()).filter((d) => d.role === "screen" && d.online).length;
    }
    /* ========== Atualizações de estado ========== */
    updateBattery(id, level) {
        const device = this.devices.get(id);
        if (device) {
            device.battery = level;
            device.lastSeen = Date.now();
            device.online = true;
        }
    }
    setOffline(id) {
        const device = this.devices.get(id);
        if (device) {
            device.online = false;
        }
    }
    updateLastSeen(id) {
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
    broadcast(message) {
        const payload = JSON.stringify(message);
        this.devices.forEach((d) => {
            if (d.ws.readyState === d.ws.OPEN) {
                d.ws.send(payload);
            }
        });
    }
}
exports.deviceStore = new DeviceStore();
