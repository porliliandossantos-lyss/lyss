// Posta um vídeo no TikTok reutilizando a sessão salva por `npm run tiktok:login`
// (scripts/tiktok-login.js). Usa o upload web (tiktok.com/upload), sem API oficial —
// isso está fora dos Termos de Uso da TikTok, por decisão já registrada na Lyss:
// autonomia total escolhida em troca do risco de restrição de conta.
//
// AINDA NÃO IMPLEMENTADO — este é o próximo passo depois que o pipeline
// de conteúdo (Groq + Piper) estiver validado e a sessão de login existir.

import { existsSync } from "node:fs";
import path from "node:path";

const SESSION_PATH = path.resolve(import.meta.dirname, "..", "..", "tiktok-session.json");

export async function postVideo({ videoPath, caption }) {
  if (!existsSync(SESSION_PATH)) {
    throw new Error("Nenhuma sessão do TikTok encontrada. Rode: npm run tiktok:login");
  }

  throw new Error(
    "postVideo() ainda não implementado. Próximo passo: usar Playwright + " +
      "storageState para abrir tiktok.com/upload, arrastar o arquivo em " +
      `"${videoPath}", preencher a legenda "${caption}" e clicar em Post.`
  );
}
