import { createServer } from "./server";
import { setupWebSocket } from "./ws/wsServer";

const server = createServer();

setupWebSocket(server);

server.listen(5000, () => {
  console.log("🚀 Express rodando na porta 5000");
});
