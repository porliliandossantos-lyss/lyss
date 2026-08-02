// Confirma que o perfil dedicado do Chrome (TIKTOK_CHROME_PROFILE) está
// logado no TikTok — sem automatizar login, só lendo o que já existe.
//
// Feche o Chrome inteiro antes de rodar: npm run tiktok:verify

import "dotenv/config";
import { launchTikTokContext } from "../src/tiktok/browser.js";

async function main() {
  console.log(`Abrindo perfil: ${process.env.TIKTOK_CHROME_PROFILE}`);
  const context = await launchTikTokContext({ headless: false });
  const page = context.pages()[0] || (await context.newPage());

  await page.goto("https://www.tiktok.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);

  const cookies = await context.cookies("https://www.tiktok.com");
  console.log(`\nCookies encontrados para tiktok.com (${cookies.length}):`);
  cookies.forEach((c) => console.log(`  - ${c.name}`));

  console.log(
    "\nOlha a janela que abriu: aparece seu feed 'Para você' e seu avatar, ou uma tela de login?"
  );
  console.log("A janela vai ficar aberta por 20 segundos pra você conferir.\n");

  await page.waitForTimeout(20000);
  await context.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
