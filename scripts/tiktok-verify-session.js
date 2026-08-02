// Confirma que o perfil dedicado do Chrome (TIKTOK_CHROME_PROFILE) está
// mesmo logado no TikTok — sem automatizar nenhum login, só lendo o estado
// que já existe porque você logou manualmente nesse perfil.
//
// Feche o Chrome inteiro antes de rodar: npm run tiktok:verify

import "dotenv/config";
import { launchTikTokContext } from "../src/tiktok/browser.js";

async function main() {
  console.log(`Abrindo perfil: ${process.env.TIKTOK_CHROME_PROFILE}`);
  const context = await launchTikTokContext({ headless: false });
  const page = context.pages()[0] || (await context.newPage());

  await page.goto("https://www.tiktok.com/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const cookies = await context.cookies("https://www.tiktok.com");
  const hasSession = cookies.some(
    (c) => ["sessionid", "sid_tt", "sessionid_ss"].includes(c.name) && c.value
  );

  if (hasSession) {
    console.log("\nLogado — cookie de sessão encontrado. Esse perfil está pronto pra Lyss usar.");
  } else {
    console.log(
      "\nNão encontrei cookie de sessão. Confirme que você logou em @godisstrengthh nesse perfil específico e tente de novo."
    );
  }

  await context.close();
  process.exit(hasSession ? 0 : 1);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
