export function renderLayout(root: HTMLElement) {
  root.innerHTML = `
    <div class="app">

      <header class="header">
        <div class="branding">
          <span class="brand-main">Cortex</span>
          <span class="brand-accent">VR</span>
        </div>
      </header>

      <section class="content">

        <!-- Preview principal -->
        <div class="preview">
          <video id="miniIframe" width="100%" height="100%" >
          <source src="./videos/demo.mp4" type="video/mp4">
          Seu navegador não suporta a tag de vídeo.
          </video>
          <div class="custom-controls"> 
          <span id="currentTime">0:00</span> 
          <input id="progressBar" type="range" min="0" max="100" value="0" step="0.1" /> 
          <span id="duration">0:00</span> 
          </div>
        </div>


        <!-- Controles de vídeo -->
        <div class="video-controls">
          <select id="videoSelect" class="video-select">
          <option value="/videos/demo.mp4">Demo</option>
          </select>

          <label for="videoUpload" class="upload-label" data-action="upload"> 
            <img src="/icons/upload-solid-full.svg" alt="Upload" /> 
          </label>
          <input type="file" name="file" id="videoUpload" accept="video/*" class="video-upload" style="display:none" />
        </div>

        <!-- Botões de controle -->
        <div class="controls">
          <button data-action="play" aria-label="Play">
            <img src="/icons/play-solid-full.svg" alt="Play" />
          </button>

          <button data-action="pause" aria-label="Pause">
            <img src="/icons/pause-solid-full.svg" alt="Pause" />
          </button>

          <button data-action="stop" aria-label="Stop">
            <img src="/icons/stop-solid-full.svg" alt="Stop" />
          </button>
        </div>

        <!-- Lista de dispositivos -->
        <section id="devices" class="devices">
          <h2 class="devices-title">Equipamentos Conectados</h2>
          <div id="deviceList" class="device-list">
            <span class="empty">Aguardando conexões...</span>
          </div>
        </section>

      </section>

      <footer class="status">
        <div id="status">
          Status: <span class="status-indicator"></span> <span id="status-text">Desconectado</span>
        </div>
        <p>|</p>
        <div id="connectedClients"> Conectados: 0</div>
      </footer>

    </div>
  `;
}
