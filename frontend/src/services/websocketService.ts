import { WSOutbound, WSInbound } from "../../../shared/wsProtocol";
import { deviceId } from "../app/device";

export function connectWebSocket(
  onMessage: (msg: WSOutbound) => void,
  setStatus: (status: "online" | "offline" | "error") => void
) {
  const ws = new WebSocket(`ws://${window.location.hostname}:5000/control`);

  ws.onopen = () => {
    setStatus("online");

    // envia mensagem inicial de registro ("hello")
    const helloMsg: WSInbound = {
      type: "hello",
      deviceId,
      role: "controller", // central sempre como controller
    };
    ws.send(JSON.stringify(helloMsg));
  };

  ws.onclose = () => setStatus("offline");
  ws.onerror = () => setStatus("error");

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WSOutbound;
      onMessage(msg);
    } catch (error) {
      console.error("❌ Failed to parse WebSocket message:", error);
    }
  };

  return ws;
}
