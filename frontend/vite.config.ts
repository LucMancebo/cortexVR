import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: ".", // raiz do projeto frontend
  base: "./", // garante que os assets sejam referenciados de forma relativa
  build: {
    outDir: "dist", // saída do build (frontend/dist)
    emptyOutDir: true, // limpa a pasta antes de gerar
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // atalho para src/
    },
  },
  server: {
    port: 5173, // porta do dev server (quando usar npm run dev)
    host: "0.0.0.0", // permite acesso pela rede local
    proxy: {
      "/api": "http://localhost:5000",   // redireciona chamadas de API para o backend
      "/videos": "http://localhost:5000" // redireciona acesso aos vídeos
    }
  },
});
