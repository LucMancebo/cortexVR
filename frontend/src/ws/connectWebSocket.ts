let retry = 0;
let onStatus: (status: boolean) => void;
let deviceId: string;
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
  retry = 0;
  onStatus(true);

  ws.send(
    JSON.stringify({
      type: "hello",
      deviceId,
      role: "controller", // ou "screen"
    })
  );
};
