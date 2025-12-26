interface Device {
  id: string;
  battery: number;
  online: boolean;
}

class Store {
  private devices: Device[] = [];
  private totalClients: number = 0;

  addDevice(device: Device) {
    this.devices.push(device);
  }

  updateDeviceStatus(deviceId: string, online: boolean) {
    const device = this.devices.find((d) => d.id === deviceId);
    if (device) {
      device.online = online;
    }
  }

  updateDeviceBattery(deviceId: string, battery: number) {
    const device = this.devices.find((d) => d.id === deviceId);
    if (device) {
      device.battery = battery;
    }
  }

  setTotalClients(count: number) {
    this.totalClients = count;
  }

  getDevices() {
    return this.devices;
  }

  getTotalClients() {
    return this.totalClients;
  }
}

export const store = new Store();
