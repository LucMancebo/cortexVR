import { renderLayout } from "../ui/layout";
import { renderDevices } from "../ui/devices";
import { devices } from "./state";
import { connectWebSocket } from "../services/websocketService";
import { WSMessage } from "../types/ws";

export function startApp() {
  const root = document.getElementById("app")!;
  renderLayout(root);

  const statusEl = document.getElementById("status")!;
  const clientsEl = document.getElementById("connectedClients")!;
  const videoSelect = document.getElementById(
    "videoSelect"
  ) as HTMLSelectElement;

  // conexão correta (não é WebSocket cru)
  const ws = connectWebSocket(handleMessage, setStatus);

  function setStatus(online: boolean) {
    statusEl.textContent = online ? "Status: Online" : "Status: Offline";
  }

  function handleMessage(message: WSMessage) {
    switch (message.type) {
      case "stat":
        devices[message.ip] = {
          level: message.level,
          lastSeen: Date.now(),
          online: true,
        };

        renderDevices(devices);
        break;

      case "clients":
        const total = message.count > 0 ? message.count - 1 : 0;
        clientsEl.textContent = "| Total: " + total;
        break;
    }
  }

  // CONTROLES
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = (btn as HTMLElement).dataset.action!;
      ws.send(action);
    });
  });

  videoSelect.addEventListener("change", (e) => {
    ws.send("load:" + (e.target as HTMLSelectElement).value);
  });
}
