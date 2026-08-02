// ATENÇÃO — testado em 02/08/2026 e NÃO FUNCIONA para o cookie de sessão:
// o Chrome moderno criptografa cookies de um jeito amarrado ao local original
// do perfil (proteção contra exatamente esse tipo de cópia). A cópia sai
// completa, mas abre sempre deslogada. Não vale a pena tentar de novo sem
// mudar de abordagem — ver HANDOFF.md ("TikTok — bloqueios encontrados").
//
// Copia o perfil do Chrome onde você já logou no TikTok (TIKTOK_CHROME_PROFILE)
// pra uma pasta isolada, só da Lyss (tiktok-chrome-profile/). Depois disso, a
// automação nunca mais compartilha o "User Data" raiz do seu Chrome do dia a
// dia — sem risco de travar seus outros perfis.
//
// Feche o Chrome inteiro antes de rodar: node scripts/tiktok-setup-isolated-profile.js

import "dotenv/config";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const sourceProfile = process.env.TIKTOK_CHROME_PROFILE;
if (!sourceProfile) {
  console.error("TIKTOK_CHROME_PROFILE não definido no .env.");
  process.exit(1);
}
if (!existsSync(sourceProfile)) {
  console.error(`Perfil não encontrado em: ${sourceProfile}`);
  process.exit(1);
}

const sourceRoot = path.dirname(sourceProfile);
const ISOLATED_ROOT = path.resolve(import.meta.dirname, "..", "tiktok-chrome-profile");
const destProfile = path.join(ISOLATED_ROOT, "Default");

mkdirSync(destProfile, { recursive: true });

console.log(`Copiando:\n  de: ${sourceProfile}\n  para: ${destProfile}\n`);

const robocopyArgs = [
  sourceProfile,
  destProfile,
  "/E",
  "/XD", "Cache", "Code Cache", "GPUCache", "Service Worker", "blob_storage", "IndexedDB",
  "/NFL", "/NDL", "/NJH", "/NJS", "/NP",
];

try {
  execFileSync("robocopy", robocopyArgs, { stdio: "inherit" });
} catch (err) {
  // robocopy retorna códigos 0-7 em sucesso (bitmask), só >=8 é falha real
  if (typeof err.status !== "number" || err.status >= 8) {
    console.error("Falha ao copiar o perfil.");
    process.exit(1);
  }
}

const sourceLocalState = path.join(sourceRoot, "Local State");
if (existsSync(sourceLocalState)) {
  copyFileSync(sourceLocalState, path.join(ISOLATED_ROOT, "Local State"));
}

console.log(`\nPronto. Atualize no .env:\nTIKTOK_CHROME_PROFILE=${destProfile}`);
