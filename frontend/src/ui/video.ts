const videoPlayer = document.getElementById('miniIframe') as HTMLVideoElement;
const videoSelect = document.getElementById('videoSelect') as HTMLSelectElement;

export function populateVideoSelector(videos: string[], selectedVideo: string | null) {
  if (!videoSelect) return;

  videoSelect.innerHTML = ''; // Limpa opções

  if (videos.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Nenhum vídeo encontrado';
    videoSelect.appendChild(option);
    return;
  }

  videos.forEach(video => {
    const option = document.createElement('option');
    option.value = video;
    // Suporta keys de blob do cliente: __clientblob__:timestamp:origName
    if (video.startsWith('__clientblob__:')) {
      const parts = video.split(':');
      option.textContent = parts.slice(2).join(':');
    } else {
      // Extrai o nome do arquivo sem a extensão para exibição
      option.textContent = video.split('.').slice(0, -1).join('.');
    }
    if (video === selectedVideo) {
      option.selected = true;
    }
    videoSelect.appendChild(option);
  });
}

export function setVideoSource(videoName: string) {
  if (!videoPlayer) return;
  // Se o vídeo for um cliente-blob, recupera o blob URL do mapa global
  // @ts-ignore
  const clientMap = (window && (window.__CLIENT_VIDEO_MAP__ as Record<string, string>)) || {};
  const videoUrl = clientMap[videoName] || `./videos/${videoName}`;
  videoPlayer.src = videoUrl;
  videoPlayer.load();
}

export function setupVideoSelectionHandler(handler: (videoName: string) => void) {
    if (!videoSelect) return;
    videoSelect.addEventListener('change', () => handler(videoSelect.value));
}

export function playVideo() {
  if (!videoPlayer) return;
  videoPlayer.play().catch(e => console.error("▶️ Erro ao tentar tocar o vídeo:", e));
}

export function pauseVideo() {
  if (!videoPlayer) return;
  videoPlayer.pause();
}

export function stopVideo() {
  if (!videoPlayer) return;
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
}

export function seekVideo(time: number) {
  if (!videoPlayer) return;
  videoPlayer.currentTime = time;
}