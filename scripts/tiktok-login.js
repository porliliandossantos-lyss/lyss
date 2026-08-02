// Abre um navegador de verdade pra VOCÊ logar no TikTok manualmente.
// A Lyss nunca vê nem guarda sua senha — só a sessão já autenticada
// (cookies), salva em tiktok-session.json (fora do git).
//
// O script detecta sozinho quando o login terminou (procurando o cookie
// de sessão do TikTok) e fecha o navegador — não precisa voltar aqui
// pra apertar nada.
//
// Rode: npm run tiktok:login

import { chromium } from "playwright";
import path from "node:path";

const SESSION_PATH = path.resolve(import.meta.dirname, "..", "tiktok-session.json");
const TIMEOUT_MS = 15 * 60 * 1000;
const SESSION_COOKIE_NAMES = ["sessionid", "sid_tt", "sessionid_ss"];

async function waitForLogin(context, page) {
  const start = Date.now();
  let lastPrint = 0;
  while (Date.now() - start < TIMEOUT_MS) {
    const cookies = await context.cookies("https://www.tiktok.com");
    if (cookies.some((c) => SESSION_COOKIE_NAMES.includes(c.name) && c.value)) {
      return true;
    }
    const elapsed = Date.now() - start;
    if (elapsed - lastPrint > 30000) {
      lastPrint = elapsed;
      const secondsLeft = Math.round((TIMEOUT_MS - elapsed) / 1000);
      console.log(`  ainda esperando o login... (${secondsLeft}s restantes, página atual: ${page.url()})`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function main() {
  console.log("Abrindo o navegador — faça login normalmente na sua conta do TikTok.");
  console.log("Assim que o login terminar, o script detecta sozinho e fecha tudo.\n");

  const browser = await chromium.launch({ headless: false, channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://www.tiktok.com/login");

  const loggedIn = await waitForLogin(context, page);

  if (!loggedIn) {
    console.log("\nTempo esgotado (5 min) sem detectar login. Rode de novo quando quiser tentar.");
    await browser.close();
    process.exit(1);
  }

  await new Promise((r) => setTimeout(r, 1500)); // deixa os cookies assentarem
  await context.storageState({ path: SESSION_PATH });
  console.log(`\nLogin detectado. Sessão salva em ${SESSION_PATH}.`);
  await browser.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no login:", err.message);
  process.exit(1);
});
