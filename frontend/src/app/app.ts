import { connectWebSocket, sendMessage } from '../services/websocketService';
import { state, setVideos, setSelectedVideo, setVideoState, DeviceState, AppState } from './state';
import { setStatus } from '../ui/footer';
import {
  populateVideoSelector,
  setVideoSource,
  setupVideoSelectionHandler,
  playVideo,
  pauseVideo,
  stopVideo,
  seekVideo,
} from '../ui/video';
import { VideoControlsService } from '../ui/controls';
import { renderDevices } from '../ui/renderDevices';
import { uploadVideo } from '../services/uploadService';
import { WSOutbound, WSInbound, WSAction, WSRole } from '../../../shared/wsProtocol';
import { deviceId } from './device';



const videoPlayer = document.getElementById('miniIframe') as HTMLVideoElement;



/**
 * Busca a lista de vídeos disponíveis na API.
 */
async function fetchVideos(): Promise<string[]> {
  try {
    const response = await fetch('/api/videos');
    if (!response.ok) {
      throw new Error(`Falha ao buscar a lista de vídeos: ${response.statusText}`);
    }
    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error('❌ Erro ao buscar vídeos:', error);
    return [];
  }
}

/**
 * Lida com a seleção de um novo vídeo no dropdown.
 */
function handleVideoSelection(videoId: string) {
  // Envia a ação de seleção de vídeo para o servidor
  const videoSelectMessage: WSInbound = {
    type: "video-action",
    deviceId: deviceId,
    action: "pause", // Assume que ao selecionar um vídeo, ele deve pausar ou iniciar pausado
    videoId: videoId,
    currentTime: 0,
  };
  sendMessage(videoSelectMessage);
}

/**
 * Lida com ações dos botões de controle (play, pause, etc.), enviando-as ao servidor.
 */
async function handleControlAction(action: WSAction | "upload", data?: any) {
  if (action === "upload") {
    if (data instanceof File) {
      try {
        console.log(`📤 Fazendo upload do vídeo: ${data.name}`);
        await uploadVideo(data);
        console.log(`✅ Upload concluído: ${data.name}`);
        // Atualiza a lista de vídeos após o upload
        await initializePlayer();
      } catch (error) {
        console.error('❌ Erro no upload:', error);
      }
    }
    return;
  }

  // Envia a ação de controle de vídeo para o servidor
  const videoControlMessage: WSInbound = {
    type: "video-action",
    deviceId: deviceId,
    action: action,
    currentTime: action === "seek" ? data : videoPlayer.currentTime, // Envia o currentTime atual para play/pause/stop
    videoId: state.selectedVideo || undefined,
  };
  sendMessage(videoControlMessage);
}

/**
 * Processa mensagens recebidas do WebSocket.
 */
function handleWsMessage(message: WSOutbound) {
  console.log('📥 Mensagem recebida do WebSocket:', message);
  if (message.type === 'snapshot') {
    const devicesRecord: Record<string, DeviceState> = message.devices.reduce(
      (acc, device) => {
        acc[device.id] = {
          role: device.role,
          online: device.online,
          lastSeen: device.lastSeen,
          level: device.battery,
        };
        return acc;
      },
      {} as Record<string, DeviceState>
    );
    renderDevices(devicesRecord);

    const connectedClientsElement =
      document.getElementById("connectedClients");
    if (connectedClientsElement) {
      connectedClientsElement.textContent = `Conectados: ${message.devices.length}`;
    }
  } else if (message.type === 'video-state') {
    // Atualiza o estado do vídeo localmente com base na mensagem do servidor
    const { videoId, action, currentTime } = message;

    if (videoId && state.selectedVideo !== videoId) {
        setVideoSource(videoId);
        setSelectedVideo(videoId);
    }

    if (currentTime !== undefined && videoPlayer.currentTime !== currentTime) {
      seekVideo(currentTime);
    }

    if (action === 'play') {
      playVideo();
    } else if (action === 'pause') {
      pauseVideo();
    } else if (action === 'stop') {
      stopVideo();
    }
    setVideoState(action, currentTime);

  } else if (message.type === 'video-selected') {
    // Esta mensagem pode ser removida se video-state for suficiente
    setSelectedVideo(message.videoId);
    if (message.videoId) {
      setVideoSource(message.videoId);
    }
  }
}

/**
 * Inicializa o player de vídeo, buscando a lista e configurando o seletor.
 */
async function initializePlayer() {
  const videos = await fetchVideos();
  setVideos(videos);

  populateVideoSelector(state.videos, state.selectedVideo);
  if (state.selectedVideo) {
    setVideoSource(state.selectedVideo);
  }
  setupVideoSelectionHandler(handleVideoSelection);
}

/**
 * Função principal que inicializa toda a aplicação.
 */
export async function startApp() {
  // Conecta ao WebSocket e define os handlers
  connectWebSocket(handleWsMessage, setStatus);

  // Inicializa os controles da UI, passando o handler para ações
  const videoControls = new VideoControlsService("miniIframe", handleControlAction);
  videoControls.bindControls(".controls");

  

  // Inicializa o player de vídeo
  await initializePlayer();

  // Solicita o estado atual do vídeo ao servidor para sincronização
  sendMessage({ type: "request-video-state", deviceId: deviceId });
}