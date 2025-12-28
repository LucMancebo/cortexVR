// src/services/websocketService.ts
import { WSOutbound, WSInbound } from "../../../shared/wsProtocol";
import { deviceId } from "../app/device";

export function connectWebSocket(
  onMessage: (msg: WSOutbound) => void,
  setStatus: (online: boolean) => void
): WebSocket {
  const ws = new WebSocket(`ws://${location.hostname}:5000/control`);

  ws.onopen = () => {
    setStatus(true);

    // envia hello automaticamente ao conectar
    const hello: WSInbound = {
      type: "hello",
      deviceId,
      role: "controller", // ou "screen" dependendo do cliente
    };
    ws.send(JSON.stringify(hello));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WSOutbound;
      onMessage(msg); // repassa qualquer tipo
    } catch (error) {
      console.error("❌ Failed to parse WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    setStatus(false);
    console.warn("⚠️ WebSocket connection closed");
  };

  ws.onerror = () => {
    setStatus(false);
    console.error("❌ WebSocket error occurred");
  };

  return ws;
}
