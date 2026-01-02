const videoSelect = document.getElementById("videoSelect") as HTMLSelectElement;
const player = document.getElementById("miniIframe") as HTMLVideoElement;

async function loadVideos() {
  const res = await fetch("/api/videos");
  const videos = await res.json();

  videos.forEach((video: { filename: string; path: string }) => {
    const option = document.createElement("option");
    option.value = video.path;
    option.textContent = video.filename;
    videoSelect.appendChild(option);
  });
}

// Atualiza player ao trocar select
videoSelect.addEventListener("change", () => {
  player.src = videoSelect.value;
  player.load();
});

loadVideos();
