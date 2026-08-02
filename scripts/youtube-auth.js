// Autoriza a Lyss a postar Shorts e responder comentários no seu canal do YouTube.
// Fluxo 100% oficial do Google: você abre o link no SEU navegador normal e aprova —
// nenhuma automação toca nisso, é exatamente como qualquer app real pede permissão.
//
// Rode: npm run youtube:auth

import "dotenv/config";
import http from "node:http";
import { getAuthUrl, saveTokenFromCode } from "../src/youtube/auth.js";

const PORT = 8787;

const server = http.createServer(async (req, res) => {
  if (!req.url.startsWith("/oauth2callback")) {
    res.writeHead(404);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get("code");

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Faltou o código de autorização.</h1>");
    return;
  }

  try {
    await saveTokenFromCode(code);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Autorizado! Pode fechar esta aba.</h1>");
    console.log("\nToken salvo em youtube-token.json. Autorização concluída.");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Erro ao trocar o código pelo token.</h1>");
    console.error("Erro:", err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT, () => {
  const authUrl = getAuthUrl();
  console.log("Abra este link no seu navegador normal e aprove o acesso:\n");
  console.log(authUrl);
  console.log("\nEsperando você aprovar...");
});
