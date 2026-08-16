// Sobe um vídeo gerado pela Lyss como "Idea" no quadro Create > Ideas do
// Buffer -- NUNCA agenda/publica sozinho. Você aprova depois abrindo a ideia
// no Buffer (app ou site) e convertendo em post manualmente.
//
// Mapeado ao vivo em 15/08/2026, navegando na conta real logada: o plano
// gratuito do Buffer NÃO tem um botão "Save as Draft" no Composer normal --
// fechar o Composer sem agendar simplesmente descarta tudo (confirmado:
// "0 posts scheduled" depois de fechar). O mecanismo real de "guardar sem
// publicar" nesse plano é o quadro Create > Ideas (/create/ideas):
// "New Idea" abre um modal com um campo de título/texto, uma zona de
// upload de mídia, e dois botões -- "Create Post" (seguiria pro Composer de
// agendamento) e "Save Idea" (o que usamos aqui, sem tocar em nenhuma rede).

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { launchBufferContext } from "./browser.js";

const IDEAS_URL = "https://publish.buffer.com/create/ideas?view=board";
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
    await page.goto(IDEAS_URL, { waitUntil: "domcontentloaded" });
    await stepShot(page, "quadro-ideas-aberto");

    const newIdeaBtn = page.getByRole("button", { name: "New Idea" }).first();
    await newIdeaBtn.waitFor({ state: "visible", timeout: 30000 });
    await newIdeaBtn.click();
    await stepShot(page, "modal-nova-ideia-aberto");

    // O placeholder desse campo é um texto de dica ROTATIVO ("Once upon a
    // time...", "Everything begins with an idea...", etc. -- confirmado ao
    // vivo, muda a cada abertura do modal) -- não dá pra usar getByPlaceholder
    // com texto fixo. É um contenteditable logo abaixo do título "Give your
    // idea a title", primeiro (e único, nesse modal) da tela.
    const titleBox = page.locator('[contenteditable="true"]').first();
    await titleBox.waitFor({ state: "visible", timeout: 15000 });
    await titleBox.click();
    await page.keyboard.type(caption, { delay: 15 });
    await stepShot(page, "legenda-digitada");

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 15000 });
    await fileInput.setInputFiles(videoPath);
    // Espera o vídeo terminar de subir/processar antes de salvar.
    await page.waitForTimeout(6000);
    await stepShot(page, "video-anexado");

    const saveIdeaBtn = page.getByRole("button", { name: "Save Idea" });
    await saveIdeaBtn.waitFor({ state: "visible", timeout: 15000 });
    await saveIdeaBtn.click({ force: true });
    await page.waitForTimeout(2000);
    await stepShot(page, "ideia-salva");

    return { saved: true };
  } finally {
    await context.close();
  }
}
