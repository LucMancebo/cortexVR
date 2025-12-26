import { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { deviceStore } from "../state/deviceStore";
import { WebSocket } from "ws";

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({
    server,
    path: "/control",
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const ip =
      req.socket.remoteAddress?.replace("::ffff:", "") || "unknown";

    console.log("🔌 Cliente conectado:", ip);

    deviceStore.add({
      id: ip,
      ws,
      online: true,
      lastSeen: Date.now(),
    });

    ws.on("message", (data) => {
      const message = data.toString();
      console.log("📩", ip, "->", message);

      const device = deviceStore.get(ip);
      if (device) {
        device.lastSeen = Date.now();
      }
    });

    ws.on("close", () => {
      console.log("❌ Cliente desconectado:", ip);
      deviceStore.remove(ip);
    });
  });
}
