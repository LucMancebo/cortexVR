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
    // Aceita ambos formatos: { videos: [...] } ou array simples
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.videos)) return data.videos.map((v: any) => typeof v === 'string' ? v : v.filename || v.id);
    return [];
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
        console.log(`📤 Fazendo upload em memória do vídeo: ${data.name}`);

        // Armazena vídeo apenas na memória do client (Blob URL) e atualiza select
        const blobUrl = URL.createObjectURL(data);
        const key = `__clientblob__:${Date.now()}:${data.name}`;
        // garante mapa global para lookup no player
        // @ts-ignore
        window.__CLIENT_VIDEO_MAP__ = window.__CLIENT_VIDEO_MAP__ || {};
        // @ts-ignore
        window.__CLIENT_VIDEO_MAP__[key] = blobUrl;

        // adiciona ao estado e atualiza seletor localmente
        state.videos.push(key);
        populateVideoSelector(state.videos, state.selectedVideo);
        console.log(`✅ Vídeo carregado em memória: ${data.name}`);

        // Envia ao backend para persistência e sincronização central
        try {
          const uploaded = await uploadVideo(data); // retorna { id, filename, path, url }
          // substitui entry local (key) pelo filename retornado pelo servidor
          const idx = state.videos.indexOf(key);
          const serverName = uploaded.filename || uploaded.id;
          if (idx !== -1) {
            state.videos[idx] = serverName as string;
          } else {
            state.videos.push(serverName as string);
          }
          // atualiza UI para usar o arquivo do servidor
          populateVideoSelector(state.videos, serverName as string);
          setSelectedVideo(serverName as string);

          // notifica o servidor para selecionar o vídeo (define playback state)
          const selectMsg: WSInbound = {
            type: "video-action",
            deviceId: deviceId,
            action: "pause",
            videoId: serverName as string,
            currentTime: 0,
          };
          sendMessage(selectMsg);

          // remove blob da memória local
          // @ts-ignore
          const blobMap = window.__CLIENT_VIDEO_MAP__ || {};
          if (blobMap[key]) {
            URL.revokeObjectURL(blobMap[key]);
            // @ts-ignore
            delete window.__CLIENT_VIDEO_MAP__[key];
          }
        } catch (err) {
          console.error('❌ Falha ao enviar ao servidor:', err);
        }
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

// Mapas locais para relacionar id <-> filename (usados para resolver videoId enviados pelo servidor)
const videoMetaById: Record<string, string> = {};
const videoMetaByFilename: Record<string, string> = {};

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

    // Se o servidor envia um `id`, resolve para filename via mapa local
    let filenameOrKey: string | null = null;
    if (videoId === null) {
      filenameOrKey = null;
    } else if (typeof videoId === 'string') {
      if (videoMetaById[videoId]) {
        filenameOrKey = videoMetaById[videoId];
      } else if (videoMetaByFilename[videoId]) {
        filenameOrKey = videoId; // already a filename
      } else {
        // fallback: use as-is (may be filename)
        filenameOrKey = videoId;
      }
    }

    if (filenameOrKey && state.selectedVideo !== filenameOrKey) {
      setVideoSource(filenameOrKey);
      setSelectedVideo(filenameOrKey);
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
  } else if (message.type === 'video-list') {
    // Recebe lista completa de vídeos (objetos) via WS
    const vids = (message as any).videos || [];
    const mapped: string[] = [];
    vids.forEach((v: any) => {
      if (v && typeof v === 'object') {
        const id = v.id;
        const filename = v.filename || v.id;
        if (id && filename) {
          videoMetaById[id] = filename;
          videoMetaByFilename[filename] = id;
        }
        mapped.push(filename);
      } else {
        mapped.push(v);
      }
    });
    setVideos(mapped);
    populateVideoSelector(state.videos, state.selectedVideo);
  } else if (message.type === 'video-uploaded') {
    // Novo vídeo foi enviado — adiciona ao select
    const v = (message as any).video;
    if (v) {
      const id = v.id;
      const filename = v.filename || id;
      if (id && filename) {
        videoMetaById[id] = filename;
        videoMetaByFilename[filename] = id;
      }
      const name = filename;
      if (!state.videos.includes(name)) {
        state.videos.push(name);
        // mantém seleção atual; atualiza UI
        populateVideoSelector(state.videos, state.selectedVideo);
      }
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

  // Conecta handler para input de upload (botão de upload usa label for="#videoUpload")
  const uploadInput = document.getElementById("videoUpload") as HTMLInputElement | null;
  if (uploadInput) {
    uploadInput.addEventListener("change", async () => {
      const file = uploadInput.files && uploadInput.files[0];
      if (file) {
        try {
          await handleControlAction("upload", file);
        } finally {
          // reset input para permitir re-upload do mesmo arquivo
          uploadInput.value = "";
        }
      }
    });
  }

  

  // Inicializa o player de vídeo
  await initializePlayer();

  // Solicita o estado atual do vídeo ao servidor para sincronização
  sendMessage({ type: "request-video-state", deviceId: deviceId });
}