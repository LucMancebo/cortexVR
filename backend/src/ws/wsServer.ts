import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { deviceStore } from "../state/deviceStore";
import { WSInbound, WSOutbound } from "../../../shared/wsProtocol";

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({
    server,
    path: "/control",
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    console.log("🔌 Cliente conectado");

    (ws as any).deviceId = null;
    (ws as any).role = null;

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString()) as WSInbound;
        console.log("📨 Mensagem recebida:", msg);

        switch (msg.type) {
          case "hello":
            // salvar no objeto ws
            (ws as any).deviceId = msg.deviceId;
            (ws as any).role = msg.role;

            deviceStore.add({
              id: msg.deviceId,
              ws,
              role: msg.role,
              online: true,
              lastSeen: Date.now(),
            });

            console.log(`👋 Registrado: ${msg.deviceId} como ${msg.role}`);

            // atualiza contagem de TODOS os devices (central + screens)
            const clientsMsg: WSOutbound = {
              type: "clients",
              count: deviceStore.count(), // 👈 agora conta todos
            };
            deviceStore.broadcast(clientsMsg);

            // envia snapshot com todos os devices e seus roles
            const snapshotMsg: WSOutbound = {
              type: "snapshot",
              ...deviceStore.snapshot(),
            };
            deviceStore.broadcast(snapshotMsg);
            break;

          case "battery":
            deviceStore.updateBattery(msg.deviceId, msg.level);

            const device = deviceStore.get(msg.deviceId);
            const stat: WSOutbound = {
              type: "stat",
              deviceId: msg.deviceId,
              level: msg.level,
              role: device ? device.role : "screen",
            };

            deviceStore.broadcast(stat);
            break;

          case "load":
            const loadMsg: WSOutbound = {
              type: "load",
              video: msg.video,
            };
            console.log(`📺 Carregar vídeo: ${msg.video}`);
            deviceStore.broadcast(loadMsg);
            break;

          case "action":
            const actionMsg: WSOutbound = {
              type: "action",
              action: msg.action,
            };
            console.log(`🎮 Ação: ${msg.action}`);
            deviceStore.broadcast(actionMsg);
            break;
        }
      } catch (err) {
        console.error("❌ Erro ao parsear mensagem:", err);
      }
    });

    ws.on("close", () => {
      console.log("❌ Cliente desconectado");
      const id = (ws as any).deviceId;
      if (id) {
        deviceStore.setOffline(id);
        console.log(`📴 Marcado como offline: ${id}`);

        // atualiza contagem de TODOS os devices
        const clientsMsg: WSOutbound = {
          type: "clients",
          count: deviceStore.count(),
        };
        deviceStore.broadcast(clientsMsg);

        // envia snapshot atualizado para remover da lista
        const snapshotMsg: WSOutbound = {
          type: "snapshot",
          ...deviceStore.snapshot(),
        };
        deviceStore.broadcast(snapshotMsg);
      }
    });
  });
}
