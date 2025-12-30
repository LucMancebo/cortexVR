type ControlAction = "play" | "pause" | "stop" | "seek";

export class VideoControlsService {
  private video: HTMLVideoElement;
  private onControlAction: (action: ControlAction, data?: any) => void;

  constructor(
    videoElementId: string,
    onControlAction: (action: ControlAction, data?: any) => void
  ) {
    const el = document.getElementById(videoElementId) as HTMLVideoElement | null;
    if (!el) {
      throw new Error(`Elemento de vídeo com id "${videoElementId}" não encontrado`);
    }
    this.video = el;
    this.onControlAction = onControlAction;

    // Listener para atualizar tempo de reprodução
    this.video.addEventListener("timeupdate", () => {
      if (!this.video.paused) {
        // envia posição atual para sincronização
        this.onControlAction("seek", this.video.currentTime);
      }
    });

    this.video.addEventListener("play", () => this.onControlAction("play"));
    this.video.addEventListener("pause", () => this.onControlAction("pause"));
    this.video.addEventListener("ended", () => this.onControlAction("stop"));
  }

  public bindControls(containerSelector: string) {
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      `${containerSelector} button`
    );

    buttons.forEach((button) => {
      const action = button.dataset.action as ControlAction | undefined;
      if (!action) return;

      button.addEventListener("click", () => {
        this.executeAction(action);
        this.onControlAction(action);
      });
    });

    // Barra de progresso (seek)
    const progressBar = document.querySelector<HTMLInputElement>(
      ".progress-bar input[type='range']"
    );
    if (progressBar) {
      progressBar.addEventListener("change", () => {
        const time = parseFloat(progressBar.value);
        this.executeAction("seek", time);
        this.onControlAction("seek", time);
      });
    }
  }

  // Executa ação localmente no vídeo
  private executeAction(action: ControlAction, data?: any) {
    switch (action) {
      case "play":
        this.video.play();
        break;
      case "pause":
        this.video.pause();
        break;
      case "stop":
        this.video.pause();
        this.video.currentTime = 0;
        break;
      case "seek":
        if (typeof data === "number") {
          this.video.currentTime = data;
        }
        break;
    }
  }
}
