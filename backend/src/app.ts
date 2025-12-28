import os from "os";
import { createServer } from "./server";
import { setupWebSocket } from "./ws/wsServer";

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}
const ip = getLocalIP();
const server = createServer();
setupWebSocket(server);

server.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando em http://192.168.1.7:5000");
});
console.log(`🌐 Acesse pela rede local em ws://${ip}:5000/control`);
