import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { deviceStore } from "../state/deviceStore";
import { WSInbound, WSOutbound } from "../domain/wsProtocol";

let currentVideo = "skyx.mp4";

function broadcast(wss: WebSocketServer, payload: WSOutbound) {
  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({
    server,
    path: "/control",
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const ip =
      req.socket.remoteAddress?.replace("::ffff:", "") || "unknown";

    console.log("🔌 Conectado:", ip);

    deviceStore.add({
      id: ip,
      ws,
      online: true,
      lastSeen: Date.now(),
    });

    // envia estado inicial
    ws.send(
      JSON.stringify({
        type: "load",
        video: currentVideo,
      })
    );

    broadcast(wss, {
      type: "clients",
      count: deviceStore.count(),
    });

    ws.on("message", (data) => {
      const msg = JSON.parse(data.toString()) as WSInbound;
      const device = deviceStore.get(ip);
      if (!device) return;

      device.lastSeen = Date.now();

      switch (msg.type) {
        case "battery":
          device.battery = msg.level;
          broadcast(wss, {
            type: "stat",
            ip,
            level: msg.level,
          });
          break;

        case "load":
          currentVideo = msg.video;
          broadcast(wss, {
            type: "load",
            video: currentVideo,
          });
          break;

        case "action":
          broadcast(wss, msg);
          break;
      }
    });

    ws.on("close", () => {
      console.log("❌ Desconectado:", ip);
      deviceStore.remove(ip);
      broadcast(wss, {
        type: "clients",
        count: deviceStore.count(),
      });
    });
  });
}
