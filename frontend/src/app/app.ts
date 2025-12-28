import { renderLayout } from "../ui/layout";
import { renderDevices } from "../ui/renderDevices";
import { devices, DeviceState } from "./state";
import { deviceId } from "./device";
import { WSOutbound } from "../../../shared/wsProtocol";
import { connectWebSocket } from "../ws/connectWebSocket";

export function startApp() {
  
  const root = document.getElementById("app")!;
  renderLayout(root);

  const statusEl = document.getElementById("status")!;
  const clientsEl = document.getElementById("connectedClients")!;
  const statusIndicator = document.querySelector(
    ".status-indicator"
  ) as HTMLElement;
  const videoSelect = document.getElementById(
    "videoSelect"
  ) as HTMLSelectElement;

  // Conexão WebSocket usando adaptador
  const ws = connectWebSocket(handleMessage, (online: boolean) =>
    setStatus(online ? "online" : "offline")
  );

  function setStatus(status: "online" | "offline" | "error") {
    statusEl.textContent = "Status: " + status;
    statusIndicator.style.backgroundColor =
      status === "online" ? "green" : status === "error" ? "orange" : "red";
  }

  function handleMessage(message: WSOutbound) {
    console.log("📨 Mensagem recebida do servidor:", message);

    switch (message.type) {
      case "stat":
        devices[message.deviceId] = {
          level: message.level,
          lastSeen: Date.now(),
          online: true,
          role: message.role || "screen",
        };
        renderDevices(devices);
        break;

      case "clients":
        clientsEl.textContent = "| Conectados: " + message.count;
        break;

      case "load":
        videoSelect.value = message.video;
        break;

      case "action":
        console.log("🎮 Ação recebida:", message.action);
        break;

      case "snapshot": {
        const updatedDevices: Record<string, DeviceState> = {};

        message.devices.forEach((d) => {
          updatedDevices[d.id] = {
            level: d.battery,
            lastSeen: d.lastSeen,
            online: d.online,
            role: d.role,
          };
        });

        // substitui completamente o estado global
        Object.keys(devices).forEach((k) => delete devices[k]);
        Object.assign(devices, updatedDevices);

        renderDevices(devices);
        clientsEl.textContent = "| Conectados: " + message.clients;
        break;
      }
    }
  }

  // CONTROLES
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = (btn as HTMLElement).dataset.action!;
      ws.send(JSON.stringify({ type: "action", deviceId, action }));
    });
  });

  videoSelect.addEventListener("change", (e) => {
    const video = (e.target as HTMLSelectElement).value;
    ws.send(JSON.stringify({ type: "load", deviceId, video }));
  });
}
