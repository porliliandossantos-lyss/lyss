// Posta um vídeo no TikTok reaproveitando o perfil do Chrome onde você já
// está logada manualmente (ver src/tiktok/browser.js). Usa o upload web
// (tiktok.com/upload), sem API oficial — isso está fora dos Termos de Uso
// da TikTok, por decisão já registrada na Lyss: autonomia total escolhida
// em troca do risco de restrição de conta.
//
// AINDA NÃO IMPLEMENTADO — próximo passo depois que `npm run tiktok:verify`
// confirmar a sessão do perfil dedicado.

import { launchTikTokContext } from "./browser.js";

export async function postVideo({ videoPath, caption }) {
  const context = await launchTikTokContext({ headless: false });
  try {
    throw new Error(
      "postVideo() ainda não implementado. Próximo passo: abrir tiktok.com/upload " +
        `nesse contexto, arrastar o arquivo em "${videoPath}", preencher a legenda ` +
        `"${caption}" e clicar em Post.`
    );
  } finally {
    await context.close();
  }
}
