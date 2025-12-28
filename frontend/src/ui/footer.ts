export function setStatus(status: "online" | "offline" | "error") {
  const indicator = document.querySelector(".status-indicator") as HTMLElement;
  if (!indicator) return;

  indicator.classList.remove("online", "warning");

  switch (status) {
    case "online":
      indicator.classList.add("online");
      break;
    case "error":
      indicator.classList.add("warning");
      break;
    case "offline":
      // mantém vermelho padrão (sem classe extra)
      break;
  }
}
