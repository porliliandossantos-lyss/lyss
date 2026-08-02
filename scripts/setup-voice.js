// Baixa o motor de voz Piper (gratuito, roda local, sem custo por caractere)
// e um modelo de voz em ingles, e deixa tudo pronto em ./voice-engine.

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "..");
const ENGINE_DIR = path.join(ROOT, "voice-engine");
const VOICES_DIR = path.join(ENGINE_DIR, "voices");

const PIPER_ZIP_URL =
  "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip";
const VOICE_BASE =
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium";
const VOICE_FILES = ["en_US-lessac-medium.onnx", "en_US-lessac-medium.onnx.json"];

async function download(url, destPath) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Falha ao baixar ${url}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  console.log(`  ok: ${path.basename(destPath)} (${(buf.length / 1024).toFixed(0)} KB)`);
}

async function main() {
  await mkdir(VOICES_DIR, { recursive: true });

  if (existsSync(path.join(ENGINE_DIR, "piper.exe"))) {
    console.log("Piper já instalado, pulando download do binário.");
  } else {
    console.log("Baixando Piper (motor de voz local, gratuito)...");
    const zipPath = path.join(ENGINE_DIR, "piper.zip");
    await download(PIPER_ZIP_URL, zipPath);
    console.log("Extraindo...");
    await run("powershell", [
      "-NoProfile",
      "-Command",
      `Expand-Archive -Path "${zipPath}" -DestinationPath "${ENGINE_DIR}" -Force`,
    ]);
    // O zip extrai numa subpasta "piper/" — move o conteúdo pra cima se necessário
    const nested = path.join(ENGINE_DIR, "piper");
    if (existsSync(nested)) {
      await run("powershell", [
        "-NoProfile",
        "-Command",
        `Move-Item -Path "${nested}\\*" -Destination "${ENGINE_DIR}" -Force; Remove-Item "${nested}" -Recurse -Force`,
      ]);
    }
    console.log("Piper extraído em voice-engine/.");
  }

  for (const file of VOICE_FILES) {
    const dest = path.join(VOICES_DIR, file);
    if (existsSync(dest)) {
      console.log(`Voz já baixada: ${file}`);
      continue;
    }
    console.log(`Baixando voz: ${file}...`);
    await download(`${VOICE_BASE}/${file}`, dest);
  }

  console.log("\nPronto. Teste com: npm run test:pipeline");
}

main().catch((err) => {
  console.error("Erro no setup de voz:", err.message);
  process.exit(1);
});
