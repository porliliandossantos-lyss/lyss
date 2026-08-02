import "dotenv/config";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { generateVideoIdeas, generateScript, generateCommentReply } from "../src/content/generateScript.js";
import { textToSpeech } from "../src/voice/piper.js";

const OUTPUT_DIR = path.resolve(import.meta.dirname, "..", "output");
const niche = process.env.DEFAULT_NICHE || "curiosities";

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`\n1) Gerando ideias de vídeo (nicho: ${niche}) via Groq...`);
  const ideas = await generateVideoIdeas(niche, 3);
  ideas.forEach((idea, i) => console.log(`   ${i + 1}. ${idea}`));

  const chosen = ideas[0];
  console.log(`\n2) Escrevendo roteiro para: "${chosen}"...`);
  const script = await generateScript(chosen);
  console.log(`   ${script}`);

  console.log("\n3) Gerando voz local com Piper...");
  const wavPath = path.join(OUTPUT_DIR, "sample.wav");
  await textToSpeech(script, wavPath);
  console.log(`   Áudio salvo em: ${wavPath}`);

  console.log("\n4) Testando resposta automática de comentário via Groq...");
  const reply = await generateCommentReply("wait is this actually true??", chosen);
  console.log(`   Resposta: "${reply}"`);

  console.log("\nPipeline completo rodou de ponta a ponta, sem custo.\n");
}

main().catch((err) => {
  console.error("\nErro no pipeline:", err.message);
  process.exit(1);
});
