import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "..");
const ENGINE_DIR = path.join(ROOT, "voice-engine");
const PIPER_BIN = path.join(ENGINE_DIR, "piper.exe");
const VOICE_MODEL = path.join(ENGINE_DIR, "voices", "en_US-lessac-medium.onnx");

export function textToSpeech(text, outputWavPath) {
  if (!existsSync(PIPER_BIN) || !existsSync(VOICE_MODEL)) {
    throw new Error("Piper não está instalado ainda. Rode: npm run setup:voice");
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(PIPER_BIN, ["--model", VOICE_MODEL, "--output_file", outputWavPath]);
    let stderr = "";
    proc.stderr.on("data", (chunk) => (stderr += chunk.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve(outputWavPath);
      else reject(new Error(`piper saiu com código ${code}: ${stderr}`));
    });
    proc.stdin.write(text);
    proc.stdin.end();
  });
}
