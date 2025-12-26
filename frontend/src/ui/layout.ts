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


        <div class="preview">
          <iframe id="miniIframe"></iframe>
        </div>

        <select id="videoSelect" class="video-select">
          <option value="skyx.mp4">SkyX</option>
          <option value="video1.mp4">Vídeo 1</option>
          <option value="video2.mp4">Vídeo 2</option>
          <option value="video3.mp4">Vídeo 3</option>
        </select>

        <div class="controls">
          <button data-action="play">
            <img src="/icons/play-solid-full.svg" alt="Play" />
          </button>

          <button data-action="pause">
            <img src="/icons/pause-solid-full.svg" alt="Pause" />
          </button>

          <button data-action="stop">
            <img src="/icons/stop-solid-full.svg" alt="Stop" />
          </button>
        </div>


        <section id="devices" class="devices">
          <span class="devices-title">Equipamentos Conectados</span>
          <div id="deviceList" class="device-list">
            <span class="empty">Aguardando conexões...</span>
          </div>
        </section>

      </section>

      <footer class="status">
        <span id="status">Status: <div class="status-indicator"></div></span>
        <span id="connectedClients">| Total: 0</span>
      </footer>

    </div>
  `;
}
