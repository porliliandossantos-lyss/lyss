// Confirma que o perfil dedicado do Chrome (TIKTOK_CHROME_PROFILE) está
// logado no TikTok. A janela fica aberta e visível — se aparecer algum
// desafio de verificação, você mesma pode resolver ali, é a sua sessão.
//
// Feche o Chrome inteiro antes de rodar: npm run tiktok:verify

import "dotenv/config";
import { launchTikTokContext } from "../src/tiktok/browser.js";

const TIMEOUT_MS = 4 * 60 * 1000;
const REAL_SESSION_COOKIE = "sessionid";

async function main() {
  console.log(`Abrindo perfil: ${process.env.TIKTOK_CHROME_PROFILE}`);
  console.log("A janela vai ficar aberta até 4 minutos. Se aparecer algum desafio de");
  console.log("verificação (captcha, 'confirme que é você'), pode resolver normalmente.\n");

  const context = await launchTikTokContext({ headless: false });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://www.tiktok.com/", { waitUntil: "domcontentloaded" });

  const start = Date.now();
  let lastPrint = 0;
  let found = false;

  while (Date.now() - start < TIMEOUT_MS) {
    const cookies = await context.cookies("https://www.tiktok.com");
    if (cookies.some((c) => c.name === REAL_SESSION_COOKIE && c.value)) {
      found = true;
      break;
    }
    const elapsed = Date.now() - start;
    if (elapsed - lastPrint > 15000) {
      lastPrint = elapsed;
      const secondsLeft = Math.round((TIMEOUT_MS - elapsed) / 1000);
      console.log(`  ainda sem sessão... (${secondsLeft}s restantes, página atual: ${page.url()})`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  const finalCookies = await context.cookies("https://www.tiktok.com");
  console.log(`\nCookies encontrados para tiktok.com (${finalCookies.length}):`);
  finalCookies.forEach((c) => console.log(`  - ${c.name}`));

  if (found) {
    console.log("\nSessão real encontrada (cookie 'sessionid'). Esse perfil está logado de verdade.");
  } else {
    console.log("\nAinda sem 'sessionid' — a sessão não foi confirmada nesta tentativa.");
  }

  await context.close();
  process.exit(found ? 0 : 1);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
