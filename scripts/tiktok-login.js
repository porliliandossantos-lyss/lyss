// Abre um navegador de verdade pra VOCÊ logar no TikTok manualmente.
// A Lyss nunca vê nem guarda sua senha — só a sessão já autenticada
// (cookies), salva em tiktok-session.json (fora do git).
//
// Rode: npm run tiktok:login

import { chromium } from "playwright";
import path from "node:path";

const SESSION_PATH = path.resolve(import.meta.dirname, "..", "tiktok-session.json");

async function main() {
  console.log("Abrindo o navegador. Faça login normalmente na sua conta do TikTok.");
  console.log("Quando terminar e a timeline carregar, volte aqui e aperte Enter.\n");

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://www.tiktok.com/login");

  await new Promise((resolve) => {
    process.stdin.once("data", resolve);
  });

  await context.storageState({ path: SESSION_PATH });
  console.log(`\nSessão salva em ${SESSION_PATH}. Pode fechar o navegador.`);
  await browser.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no login:", err.message);
  process.exit(1);
});
