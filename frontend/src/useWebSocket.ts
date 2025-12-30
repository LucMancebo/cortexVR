import { useState, useEffect, useRef } from 'react';

/**
 * Hook customizado para gerenciar a conexão WebSocket.
 * Inclui lógica de reconexão automática.
 * @returns Um objeto com o status da conexão e uma função para enviar mensagens.
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  // Ref para controlar tentativas de reconexão e evitar loops infinitos
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const connect = () => {
      // Correção: Utiliza o hostname da janela e o protocolo 'ws://'
      // e aponta para a rota '/control' do backend.
      const socket = new WebSocket(`ws://${window.location.hostname}:5000/control`);
      ws.current = socket;

      socket.onopen = () => {
        console.log('✅ Conectado ao servidor WebSocket.');
        setIsConnected(true);
        reconnectAttempts.current = 0; // Reseta as tentativas ao conectar
      };

      socket.onclose = () => {
        console.log('❌ Desconectado do servidor WebSocket.');
        setIsConnected(false);

        // Lógica de reconexão com backoff exponencial
        if (reconnectAttempts.current < 5) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000;
          console.log(`Tentando reconectar em ${timeout / 1000}s...`);
          setTimeout(connect, timeout);
          reconnectAttempts.current++;
        } else {
          console.error('Não foi possível reconectar ao WebSocket após várias tentativas.');
        }
      };

      socket.onerror = (error) => {
        console.error('Erro no WebSocket:', error);
        socket.close(); // Garante que o onclose seja chamado para tentar reconectar
      };
    };

    connect(); // Inicia a primeira conexão

    // Função de limpeza para ser chamada quando o componente que usa o hook for desmontado
    return () => {
      reconnectAttempts.current = 10; // Impede a reconexão ao desmontar
      ws.current?.close();
    };
  }, []);

  const sendMessage = (message: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado. Mensagem não enviada:', message);
    }
  };

  return { isConnected, sendMessage };
};
