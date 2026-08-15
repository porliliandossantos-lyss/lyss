// Confirma que o perfil dedicado do Chrome (BUFFER_CHROME_PROFILE) está
// logado no Buffer. A janela fica aberta e visível — se ainda não estiver
// logada, é aqui que você loga manualmente (só essa janela, sem automação
// anexada); se já estiver, só confirma. Mesmo padrão de
// scripts/tiktok-verify-session.js.
//
// Feche o Chrome inteiro antes de rodar:
//   npm run buffer:verify

import "dotenv/config";
import { launchBufferContext } from "../src/buffer/browser.js";

const TIMEOUT_MS = 4 * 60 * 1000;

async function main() {
  console.log(`Abrindo perfil: ${process.env.BUFFER_CHROME_PROFILE}`);
  console.log("A janela vai ficar aberta até 4 minutos. Se pedir login, é a sua vez de digitar\n(login real da conta do Buffer) -- ninguém automatizado vai tocar nisso.\n");

  const context = await launchBufferContext({ headless: false });
  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://publish.buffer.com/", { waitUntil: "domcontentloaded" });

  const start = Date.now();
  let lastPrint = 0;
  let found = false;

  while (Date.now() - start < TIMEOUT_MS) {
    const url = page.url();
    // Buffer redireciona pra /login quando não há sessão; qualquer outra
    // rota dentro de publish.buffer.com indica que a conta está logada.
    if (url.includes("publish.buffer.com") && !url.includes("/login") && !url.includes("/signup")) {
      found = true;
      break;
    }
    const elapsed = Date.now() - start;
    if (elapsed - lastPrint > 15000) {
      lastPrint = elapsed;
      const secondsLeft = Math.round((TIMEOUT_MS - elapsed) / 1000);
      console.log(`  ainda sem sessão... (${secondsLeft}s restantes, página atual: ${url})`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(found ? "\nSessão encontrada. Esse perfil está logado de verdade no Buffer." : "\nAinda não confirmei login nesta tentativa.");

  await context.close();
  process.exit(found ? 0 : 1);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
