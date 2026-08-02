import { chat } from "./groqClient.js";

const LANGUAGE = process.env.CONTENT_LANGUAGE || "en";

export async function generateVideoIdeas(niche, count = 3) {
  const reply = await chat([
    {
      role: "system",
      content:
        "You generate short-form video hook ideas for a faceless TikTok channel. " +
        "Reply with a numbered list only, one idea per line, no extra commentary. " +
        `Language: ${LANGUAGE}.`,
    },
    {
      role: "user",
      content: `Give me ${count} viral video hook ideas for the niche "${niche}". Each hook should be under 12 words and create curiosity.`,
    },
  ]);

  return reply
    .split("\n")
    .map((line) => line.replace(/^\d+[\).\s-]*/, "").trim())
    .filter(Boolean);
}

export async function generateScript(idea) {
  return chat([
    {
      role: "system",
      content:
        "You write scripts for 20-30 second faceless TikTok videos, narrated by a single AI voice. " +
        "Write in a punchy, conversational tone. Return only the narration text, no scene directions, " +
        `no timestamps. Language: ${LANGUAGE}.`,
    },
    {
      role: "user",
      content: `Write the narration for this video hook: "${idea}"`,
    },
  ]);
}

export async function generateCommentReply(commentText, videoContext) {
  return chat(
    [
      {
        role: "system",
        content:
          "You reply to TikTok comments as the channel's voice: friendly, brief, in-character, never rude, " +
          `never political, no emojis spam (max one). Language: ${LANGUAGE}.`,
      },
      {
        role: "user",
        content: `Video context: "${videoContext}"\nComment: "${commentText}"\nWrite a short reply (under 15 words).`,
      },
    ],
    { temperature: 0.6, maxTokens: 60 }
  );
}
