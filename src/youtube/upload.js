import { google } from "googleapis";
import { createReadStream } from "node:fs";
import { getAuthorizedClient } from "./auth.js";

export async function uploadShort({ videoPath, title, description, tags = [] }) {
  const auth = getAuthorizedClient();
  const youtube = google.youtube({ version: "v3", auth });

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description: `${description}\n\n#Shorts`,
        tags,
        categoryId: "24", // Entertainment
      },
      status: {
        privacyStatus: "public",
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: createReadStream(videoPath),
    },
  });

  return { videoId: res.data.id, url: `https://youtube.com/shorts/${res.data.id}` };
}
