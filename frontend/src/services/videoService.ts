type ControlAction = "play" | "pause" | "stop";

export class VideoControlsService {
  private video: HTMLVideoElement;

  constructor(videoElementId: string) {
    const el = document.getElementById(videoElementId) as HTMLVideoElement | null;
    if (!el) {
      throw new Error(`Elemento de vídeo com id "${videoElementId}" não encontrado`);
    }
    this.video = el;
  }

  public bindControls(containerSelector: string) {
    const buttons = document.querySelectorAll<HTMLButtonElement>(`${containerSelector} button`);

    buttons.forEach((button) => {
      const action = button.dataset.action as ControlAction | undefined;
      if (!action) return;

      button.addEventListener("click", () => {
        this.handleAction(action);
      });
    });
  }

  private handleAction(action: ControlAction) {
    switch (action) {
      case "play":
        this.video.play();
        break;
      case "pause":
        this.video.pause();
        break;
      case "stop":
        this.video.pause();
        this.video.currentTime = 0; // volta ao início
        break;
    }
  }
}
