// backend/src/ws/wsServer.ts
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { deviceStore } from "../state/deviceStore";
import { videoService } from "../services/videoService";
import { WSInbound, WSOutbound, WSAction } from "../../../shared/wsProtocol";
import { videoStore } from "../state/videoStore";

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
              count: deviceStore.count(),
            };
            deviceStore.broadcast(clientsMsg);

            // envia snapshot com todos os devices e seus roles
            const snapshotMsg: WSOutbound = {
              type: "snapshot",
              ...deviceStore.snapshot(),
            };
            deviceStore.broadcast(snapshotMsg);

            // Envia lista de vídeos para o novo cliente
            const videos = videoService.list();
            const videoListMsg: WSOutbound = {
              type: "video-list",
              videos: videos.map((v) => ({
                id: v.id,
                filename: v.filename,
                originalName: v.originalName,
                size: v.size,
                uploadedAt: v.uploadedAt,
              })),
            };
            ws.send(JSON.stringify(videoListMsg));

            // NOVO: Envia o estado atual do vídeo para o novo cliente
            const currentVideoState = videoStore.getPlaybackState();
            const videoStateMsg: WSOutbound = {
              type: "video-state",
              videoId: currentVideoState.videoId,
              action: currentVideoState.action,
              currentTime: currentVideoState.currentTime,
            };
            ws.send(JSON.stringify(videoStateMsg));
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

          case "video-action":
            console.log(`🎬 Ação de vídeo recebida de ${msg.deviceId}: ${msg.action}`);

            let newVideoId = msg.videoId !== undefined ? msg.videoId : videoStore.getPlaybackState().videoId;
            let newAction: WSAction | null = msg.action;
            let newCurrentTime = msg.currentTime !== undefined
                ? msg.currentTime
                : (msg.action === "stop" ? 0 : videoStore.getPlaybackState().currentTime);

            videoStore.setPlaybackState(newVideoId, newAction, newCurrentTime);

            // Broadcast do novo estado do vídeo para todos os clientes
            const updatedState = videoStore.getPlaybackState();
            const broadcastVideoStateMsg: WSOutbound = {
                type: "video-state",
                videoId: updatedState.videoId,
                action: updatedState.action,
                currentTime: updatedState.currentTime,
            };
            deviceStore.broadcast(broadcastVideoStateMsg);
            break;

          case "request-videos":
            const allVideos = videoService.list();
            const listMsg: WSOutbound = {
              type: "video-list",
              videos: allVideos.map((v) => ({
                id: v.id,
                filename: v.filename,
                originalName: v.originalName,
                size: v.size,
                uploadedAt: v.uploadedAt,
              })),
            };
            ws.send(JSON.stringify(listMsg));
            break;

          case "request-video-state":
            const currentVideoStateOnRequest = videoStore.getPlaybackState();
            const requestedVideoStateMsg: WSOutbound = {
              type: "video-state",
              videoId: currentVideoStateOnRequest.videoId,
              action: currentVideoStateOnRequest.action,
              currentTime: currentVideoStateOnRequest.currentTime,
            };
            ws.send(JSON.stringify(requestedVideoStateMsg));
            break;

            // Removidos: case "load", case "action", case "video-select"
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

  return wss;
}