// Abre o Buffer reaproveitando um perfil do Chrome onde o login já foi feito
// manualmente por você (nunca pela Lyss, nunca de forma automatizada) — mesmo
// padrão de src/tiktok/browser.js. Serve pra subir os vídeos gerados como
// rascunho no Buffer, que você depois aprova pelo celular (plano gratuito não
// tem API, então isso substitui o upload manual pelo painel).
//
// Requer BUFFER_CHROME_PROFILE no .env — caminho completo até a pasta do
// perfil, ex: "...\User Data\Profile 1" —, e o Chrome inteiro fechado antes
// de rodar (a raiz "User Data" fica travada enquanto qualquer janela do
// Chrome está aberta, mesmo em outro perfil).

import { chromium } from "playwright";
import path from "node:path";

export async function launchBufferContext({ headless = false } = {}) {
  const profileDir = process.env.BUFFER_CHROME_PROFILE;
  if (!profileDir) {
    throw new Error("BUFFER_CHROME_PROFILE não definido no .env.");
  }

  const userDataRoot = path.dirname(profileDir);
  const profileName = path.basename(profileDir);

  let context;
  try {
    context = await chromium.launchPersistentContext(userDataRoot, {
      channel: "chrome",
      headless,
      viewport: null,
      chromiumSandbox: true,
      ignoreDefaultArgs: ["--enable-automation"],
      args: [`--profile-directory=${profileName}`, "--mute-audio"],
    });
  } catch (err) {
    if (String(err.message).includes("ProcessSingleton") || String(err.message).includes("lock")) {
      throw new Error(
        "Não consegui abrir o perfil — o Chrome provavelmente ainda está aberto (em qualquer perfil). Feche todas as janelas do Chrome e tente de novo."
      );
    }
    throw err;
  }

  return context;
}
