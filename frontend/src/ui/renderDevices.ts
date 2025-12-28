import { DeviceState } from "../app/state"; // ajuste o caminho se precisar

export function renderDevices(devices: Record<string, DeviceState>) {
  const container = document.getElementById("deviceList")!;
  container.innerHTML = "";

  const entries = Object.entries(devices);

  if (entries.length === 0) {
    container.innerHTML = `<span class="empty">Aguardando conexões...</span>`;
    return;
  }

  entries.forEach(([id, device]) => {
    const { level = 0, online, role } = device;

    // cor da bateria: verde se >40%, vermelho se <=40
    const batteryColor = level > 40 ? "#4caf50" : "#ff5252";
    // ícone de status
    const statusIcon = online ? "🟢" : "🔴";
    // opacidade para offline
    const opacity = online ? 1 : 0.5;

    // rótulo conforme o papel
    let label =
      role === "controller"
        ? `💻 Central <strong>${id}</strong>`
        : `🕶️ Óculos <strong>${id}</strong>`;

    // monta o HTML (bateria só para óculos)
    container.innerHTML += `
      <div class="device-item" style="opacity:${opacity}">
        <span class="device-id">${statusIcon} ${label}</span>
        ${
          role === "screen"
            ? `<span class="device-battery" style="color:${batteryColor}; font-weight:bold;">
                 🔋 ${level}%
               </span>`
            : ""
        }
      </div>
    `;
  });
}
