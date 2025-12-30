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
  ws = new WebSocket(`ws://${window.location.hostname}:5000/control`);

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
