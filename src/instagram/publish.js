import { graphRequest, igAccountId } from "./graphClient.js";

// O Instagram exige uma URL pública pra buscar o vídeo — não aceita upload
// direto de arquivo. Defina INSTAGRAM_VIDEO_PUBLIC_BASE_URL apontando pra
// onde os .mp4 da Lyss ficam hospedados publicamente (ex: pasta estática
// servida pelo próprio deploy no Render).
function publicVideoUrl(fileName) {
  const base = process.env.INSTAGRAM_VIDEO_PUBLIC_BASE_URL;
  if (!base) throw new Error("INSTAGRAM_VIDEO_PUBLIC_BASE_URL não definido no .env.");
  return `${base.replace(/\/$/, "")}/${fileName}`;
}

async function waitUntilReady(containerId, timeoutMs = 2 * 60 * 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await graphRequest(`/${containerId}?fields=status_code`);
    if (status.status_code === "FINISHED") return true;
    if (status.status_code === "ERROR") throw new Error("Instagram falhou ao processar o vídeo.");
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Tempo esgotado esperando o Instagram processar o vídeo.");
}

export async function publishReel({ fileName, caption }) {
  const accountId = igAccountId();
  const videoUrl = publicVideoUrl(fileName);

  const container = await graphRequest(`/${accountId}/media`, {
    method: "POST",
    body: { media_type: "REELS", video_url: videoUrl, caption },
  });

  await waitUntilReady(container.id);

  const published = await graphRequest(`/${accountId}/media_publish`, {
    method: "POST",
    body: { creation_id: container.id },
  });

  return { mediaId: published.id };
}
