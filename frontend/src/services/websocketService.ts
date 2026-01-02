import { WSOutbound, WSInbound } from "../../../shared/wsProtocol";
import { deviceId } from "../app/device";

let ws: WebSocket | null = null;

export function sendMessage(message: WSInbound) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    console.error("❌ WebSocket is not connected. Cannot send message:", message);
  }
}

export function connectWebSocket(
  onMessage: (msg: WSOutbound) => void,
  setStatus: (status: "online" | "offline" | "error") => void
) {
  const protocol = (location.protocol === 'https:') ? 'wss' : 'ws';
  // Use Vite env var if provided, otherwise fallback to 5000
  // set VITE_WS_PORT in frontend env for different deployments
  // @ts-ignore
  const wsPort = (import.meta?.env?.VITE_WS_PORT as string) || '5000';
  const wsUrl = `${protocol}://${window.location.hostname}:${wsPort}/control`;
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    setStatus("online");

    const helloMsg: WSInbound = {
      type: "hello",
      deviceId,
      role: "controller",
    };
    sendMessage(helloMsg);
  };

  ws.onclose = () => {
    setStatus("offline");
    ws = null;
  };
  ws.onerror = () => {
    setStatus("error");
    ws = null;
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WSOutbound;
      onMessage(msg);
    } catch (error) {
      console.error("❌ Failed to parse WebSocket message:", error);
    }
  };
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}
