const videoPlayer = document.getElementById('video-player') as HTMLVideoElement;
const videoSelect = document.getElementById('video-select') as HTMLSelectElement;
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

export function updateConnectionStatus(status: 'online' | 'offline' | 'error') {
  if (!statusIndicator || !statusText) return;

  statusIndicator.className = ''; // Limpa classes
  statusIndicator.classList.add(status);
  statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
}

export function populateVideoSelector(videos: string[], selectedVideo: string) {
  if (!videoSelect) return;

  videoSelect.innerHTML = ''; // Limpa opções existentes

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
    option.textContent = video.split('/').pop()?.split('.').slice(0, -1).join('.') || video; // Mostra o nome sem extensão e sem path
    if (video === selectedVideo) {
      option.selected = true;
    }
    videoSelect.appendChild(option);
  });
}

export function setVideoSource(videoPath: string) {
  if (!videoPlayer) return;
  
  videoPlayer.src = videoPath;
  videoPlayer.load();
  videoPlayer.play().catch(e => console.error("▶️ Erro ao tentar tocar o vídeo:", e));
}

export function setupVideoSelectionHandler(handler: (videoName: string) => void) {
    if (!videoSelect) return;
    videoSelect.addEventListener('change', () => {
        handler(videoSelect.value);
    });
}