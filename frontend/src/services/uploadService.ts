export interface UploadResponse {
  file: {
    filename: string;
    path: string;
    url?: string; // opcional, se o backend retornar já o caminho público
  };
  error?: string;
}

export async function uploadVideo(file: File): Promise<string> {
  const formData = new FormData();
  // O campo deve ser "video" para corresponder ao backend
  formData.append("video", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data: UploadResponse = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || "Erro no upload");
    }

    if (!data.file?.path && !data.file?.filename) {
      throw new Error("Resposta inválida do backend: caminho do vídeo não recebido");
    }

    // Se o backend já retorna URL pública, usa ela
    if (data.file.url) {
      return data.file.url;
    }

    // Caso contrário, monta a URL pública a partir da pasta /videos
    return `/videos/${data.file.filename}`;
  } catch (err: any) {
    console.error("❌ Erro no upload:", err);
    throw new Error(err.message || "Falha ao enviar vídeo");
  }
}
