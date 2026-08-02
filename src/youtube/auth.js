import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const TOKEN_PATH = path.resolve(import.meta.dirname, "..", "..", "youtube-token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];

function buildOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET não definidos no .env.");
  }
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI || "http://localhost:8787/oauth2callback"
  );
}

export function getAuthUrl() {
  const client = buildOAuthClient();
  return client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });
}

export async function saveTokenFromCode(code) {
  const client = buildOAuthClient();
  const { tokens } = await client.getToken(code);
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  return tokens;
}

export function getAuthorizedClient() {
  if (!existsSync(TOKEN_PATH)) {
    throw new Error("Nenhum token do YouTube salvo ainda. Rode: npm run youtube:auth");
  }
  const client = buildOAuthClient();
  client.setCredentials(JSON.parse(readFileSync(TOKEN_PATH, "utf8")));
  return client;
}
