import { google } from "googleapis";
import { getAuthorizedClient } from "./auth.js";

export async function listNewComments(videoId, maxResults = 20) {
  const auth = getAuthorizedClient();
  const youtube = google.youtube({ version: "v3", auth });

  const res = await youtube.commentThreads.list({
    part: ["snippet"],
    videoId,
    order: "time",
    maxResults,
  });

  return (res.data.items || []).map((item) => ({
    commentId: item.snippet.topLevelComment.id,
    author: item.snippet.topLevelComment.snippet.authorDisplayName,
    text: item.snippet.topLevelComment.snippet.textOriginal,
    hasReply: item.snippet.totalReplyCount > 0,
  }));
}

export async function replyToComment(commentId, text) {
  const auth = getAuthorizedClient();
  const youtube = google.youtube({ version: "v3", auth });

  await youtube.comments.insert({
    part: ["snippet"],
    requestBody: {
      snippet: { parentId: commentId, textOriginal: text },
    },
  });
}
