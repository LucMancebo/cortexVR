export function setStatus(status: "online" | "offline" | "error") {
  const indicator = document.querySelector(".status-indicator") as HTMLElement;
  const statusText = document.getElementById("status-text") as HTMLElement;
  if (!indicator || !statusText) return;

  indicator.classList.remove("online", "warning");

  switch (status) {
    case "online":
      indicator.classList.add("online");
      statusText.textContent = "Conectado";
      break;
    case "error":
      indicator.classList.add("warning");
      statusText.textContent = "Erro de conexão";
      break;
    case "offline":
      statusText.textContent = "Desconectado";
      // mantém vermelho padrão (sem classe extra)
      break;
  }
}
