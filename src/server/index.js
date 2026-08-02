import "dotenv/config";
import express from "express";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3300;
const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "..", "public");

app.use(express.static(PUBLIC_DIR));

app.get("/api/status", (_req, res) => {
  res.json({
    autonomyMode: "full",
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    tiktokSessionConfigured: false,
    goal: {
      followersTarget: Number(process.env.GOAL_FOLLOWERS_TARGET || 0),
      deadline: process.env.GOAL_DEADLINE || null,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Lyss rodando em http://localhost:${PORT}`);
});
