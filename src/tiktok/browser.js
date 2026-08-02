// Abre o TikTok reaproveitando um perfil do Chrome onde o login já foi feito
// manualmente por você (nunca pela Lyss, nunca de forma automatizada — o Google
// bloqueia login automatizado de propósito, e não tentamos contornar isso).
//
// Requer TIKTOK_CHROME_PROFILE no .env (o caminho completo até a pasta do
// perfil, ex: "...\User Data\Profile 6"), e o Chrome inteiro fechado antes de
// rodar — a raiz "User Data" fica travada enquanto qualquer janela do Chrome
// está aberta, mesmo em outro perfil.
//
// Importante: o Chrome espera "--user-data-dir" apontando pra pasta RAIZ
// ("User Data"), e "--profile-directory" dizendo qual perfil usar dentro
// dela. Passar a pasta do perfil direto como raiz faz o Chrome criar um
// perfil novo e vazio ali dentro, ignorando o perfil real — por isso
// separamos os dois abaixo.

import { chromium } from "playwright";
import { existsSync } from "node:fs";
import path from "node:path";

export async function launchTikTokContext({ headless = false } = {}) {
  const profileDir = process.env.TIKTOK_CHROME_PROFILE;
  if (!profileDir) {
    throw new Error("TIKTOK_CHROME_PROFILE não definido no .env.");
  }
  if (!existsSync(profileDir)) {
    throw new Error(`Perfil do Chrome não encontrado em: ${profileDir}`);
  }

  const userDataRoot = path.dirname(profileDir);
  const profileName = path.basename(profileDir);

  let context;
  try {
    context = await chromium.launchPersistentContext(userDataRoot, {
      channel: "chrome",
      headless,
      viewport: null,
      args: [`--profile-directory=${profileName}`],
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
