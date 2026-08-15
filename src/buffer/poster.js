// Sobe um vídeo gerado pela Lyss como RASCUNHO no Buffer (nunca agenda/publica
// sozinho) — plano gratuito do Buffer não tem API, então isso reproduz pelo
// navegador o mesmo upload que você faria na mão. Você aprova depois pelo
// app do Buffer no celular, e só a partir daí ele publica de verdade.
//
// AVISO: os seletores abaixo são um primeiro palpite, escritos sem ter visto
// a tela real logada do Buffer (a conta ainda não existia quando isso foi
// escrito). Bem provável que precise ajustar ao vivo assim que houver uma
// conta de teste — mesma coisa que aconteceu várias vezes com
// src/tiktok/poster.js até ele funcionar de verdade. Os screenshots em
// output/debug-steps/ (stepShot) existem justamente pra facilitar esse ajuste.

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { launchBufferContext } from "./browser.js";

const COMPOSE_URL = "https://publish.buffer.com/";
const OUTPUT_DIR = path.resolve(import.meta.dirname, "..", "..", "output");
const DEBUG_STEPS_DIR = path.join(OUTPUT_DIR, "debug-steps");
let stepCounter = 0;

async function stepShot(page, label) {
  stepCounter += 1;
  try {
    await mkdir(DEBUG_STEPS_DIR, { recursive: true });
    const file = path.join(DEBUG_STEPS_DIR, `buffer-${String(stepCounter).padStart(2, "0")}-${label}.png`);
    await page.screenshot({ path: file });
  } catch {
    // rastreamento nunca pode derrubar o upload em si
  }
}

export async function saveDraftToBuffer({ videoPath, caption }) {
  stepCounter = 0;
  const context = await launchBufferContext({ headless: false });
  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(COMPOSE_URL, { waitUntil: "domcontentloaded" });
    await stepShot(page, "painel-aberto");

    // "Create Post" / "New Post" -- texto exato ainda não confirmado ao vivo.
    const newPostBtn = page.getByRole("button", { name: /create post|new post/i }).first();
    await newPostBtn.waitFor({ state: "visible", timeout: 30000 });
    await newPostBtn.click();
    await stepShot(page, "compositor-aberto");

    // Por padrão, seleciona TODOS os canais conectados (o composer do Buffer
    // normalmente já vem com todos marcados) -- não escolhe um específico,
    // já que o plano gratuito só permite 3 canais no total mesmo.
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 30000 });
    await fileInput.setInputFiles(videoPath);
    await stepShot(page, "video-selecionado");

    // Espera o upload/processamento do vídeo terminar antes de digitar --
    // tempo generoso de propósito, vídeo pode levar um tempo pra processar.
    await page.waitForTimeout(5000);
    await stepShot(page, "apos-espera-processamento");

    const captionBox = page.locator('[contenteditable="true"], textarea').first();
    await captionBox.click();
    await page.keyboard.type(caption, { delay: 15 });
    await stepShot(page, "legenda-digitada");

    // "Save as Draft" -- nunca "Add to Queue"/"Schedule", que publicaria
    // sozinho sem sua aprovação pelo celular.
    const saveDraftBtn = page.getByRole("button", { name: /save as draft|save draft/i });
    await saveDraftBtn.waitFor({ state: "visible", timeout: 15000 });
    await saveDraftBtn.click();
    await stepShot(page, "salvou-rascunho");

    return { saved: true };
  } finally {
    await context.close();
  }
}
