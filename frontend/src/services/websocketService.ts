import { WSMessage } from "../types/ws";
import { parseMessage } from "./wsParser";

export function connectWebSocket(
  onMessage: (msg: WSMessage) => void,
  onStatus: (online: boolean) => void
) {
  let ws: WebSocket;
  let retry = 0;

  function connect() {
    ws = new WebSocket(`ws://${location.hostname}:5000/control`);

    ws.onopen = () => {
      retry = 0;
      onStatus(true);
    };

    ws.onclose = () => {
      onStatus(false);
      retry++;
      setTimeout(connect, Math.min(3000 * retry, 10000));
    };

    ws.onmessage = (event) => {
      const parsed = parseMessage(event.data);
      if (parsed) onMessage(parsed);
    };
  }

  connect();

  return {
    send(message: string) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    }
  };
}
