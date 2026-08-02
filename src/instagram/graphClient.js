const GRAPH_BASE = "https://graph.facebook.com/v21.0";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não definido no .env.`);
  return value;
}

export async function graphRequest(pathSegment, { method = "GET", body } = {}) {
  const accessToken = requireEnv("INSTAGRAM_ACCESS_TOKEN");
  const url = new URL(`${GRAPH_BASE}${pathSegment}`);

  const init = { method, headers: {} };
  if (method === "GET") {
    url.searchParams.set("access_token", accessToken);
  } else {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify({ ...body, access_token: accessToken });
  }

  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Instagram Graph API erro: ${JSON.stringify(data)}`);
  }
  return data;
}

export function igAccountId() {
  return requireEnv("INSTAGRAM_BUSINESS_ACCOUNT_ID");
}
