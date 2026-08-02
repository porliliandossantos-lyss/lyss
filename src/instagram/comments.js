import { graphRequest } from "./graphClient.js";

export async function listComments(mediaId) {
  const res = await graphRequest(`/${mediaId}/comments?fields=id,text,username,timestamp`);
  return (res.data || []).map((c) => ({
    id: c.id,
    author: c.username,
    text: c.text,
    timestamp: c.timestamp,
  }));
}

export async function replyToComment(commentId, message) {
  return graphRequest(`/${commentId}/replies`, {
    method: "POST",
    body: { message },
  });
}
