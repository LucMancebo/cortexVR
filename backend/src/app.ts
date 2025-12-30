// backend/src/app.ts
import os from "os";
import { createServer } from "./server";
import { WebSocketServer, WebSocket } from "ws";

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (!ifaceList) continue;

    for (const iface of ifaceList) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const ip = getLocalIP();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

const server = createServer();

// --- Lógica do WebSocket para Sincronização ---
const wss = new WebSocketServer({ noServer: true });

// Armazena todos os clientes (óculos VR) conectados
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  console.log("✅ Novo cliente conectado ao /control.");
  clients.add(ws);

  ws.on("message", (message) => {
    const messageString = message.toString();
    console.log("Mensagem recebida: %s", messageString);

    // Retransmite a mensagem para TODOS os outros clientes conectados.
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  });

  ws.on("close", () => {
    console.log("❌ Cliente desconectado do /control.");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("❌ Erro no WebSocket:", error);
    clients.delete(ws);
  });
});

// Escuta em todas as interfaces (0.0.0.0)
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando em todas as interfaces na porta ${PORT}`);
  console.log(`➡️ Localhost:   http://localhost:${PORT}`);
  console.log(`➡️ Rede local:  http://${ip}:${PORT}`);
  console.log(`🌐 WebSocket:   ws://${ip}:${PORT}/control`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Porta ${PORT} já está em uso`);
  } else {
    console.error("❌ Erro ao iniciar servidor:", err);
  }
});

// Delega as conexões WebSocket para o caminho /control
server.on("upgrade", (request, socket, head) => {
  if (request.url === "/control") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
