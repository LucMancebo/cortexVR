import { DeviceState } from "../app/state"; // ajuste o caminho se precisar

const deviceList = document.getElementById("deviceList") as HTMLElement;

export function renderDevices(devices: Record<string, DeviceState>) {
  deviceList.innerHTML = "";

  const entries = Object.entries(devices);

  if (entries.length === 0) {
    deviceList.innerHTML = `<span class="empty">Aguardando conexões...</span>`;
    return;
  }

  entries.forEach(([ip, device]) => {
    const { level = 0, online } = device;

    const color = level > 40 ? "#4caf50" : "#ff5252";
    const status = online ? "🟢" : "🔴";
    const opacity = online ? 1 : 0.5;

    deviceList.innerHTML += `
      <div class="device-item" style="opacity:${opacity}">
        <span>${status} Óculos <strong>.${ip}</strong></span>
        <span style="color:${color}; font-weight:bold;">
          ${level}%
        </span>
      </div>
    `;
  });
}
