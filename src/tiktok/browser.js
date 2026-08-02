// Abre o TikTok reaproveitando um perfil do Chrome onde o login já foi feito
// manualmente por você (nunca pela Lyss, nunca de forma automatizada — o Google
// bloqueia login automatizado de propósito, e não tentamos contornar isso).
//
// Requer TIKTOK_CHROME_PROFILE no .env, e o Chrome inteiro fechado antes de rodar
// (a pasta do perfil fica travada enquanto o Chrome está aberto).

import { chromium } from "playwright";
import { existsSync } from "node:fs";

export async function launchTikTokContext({ headless = false } = {}) {
  const profileDir = process.env.TIKTOK_CHROME_PROFILE;
  if (!profileDir) {
    throw new Error("TIKTOK_CHROME_PROFILE não definido no .env.");
  }
  if (!existsSync(profileDir)) {
    throw new Error(`Perfil do Chrome não encontrado em: ${profileDir}`);
  }

  let context;
  try {
    context = await chromium.launchPersistentContext(profileDir, {
      channel: "chrome",
      headless,
      viewport: null,
    });
  } catch (err) {
    if (String(err.message).includes("ProcessSingleton") || String(err.message).includes("lock")) {
      throw new Error(
        "Não consegui abrir o perfil — o Chrome provavelmente ainda está aberto. Feche todas as janelas do Chrome e tente de novo."
      );
    }
    throw err;
  }

  return context;
}
