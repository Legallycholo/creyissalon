import { getGoogleAccessToken } from "./google-auth";

type AgentEvent = { content?: { parts?: { text?: string }[] } };
const RETRY_DELAYS = [1200, 2500];

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseReply(body: string) {
  for (const line of body.trim().split("\n").reverse()) {
    try {
      const parsed = JSON.parse(line) as AgentEvent | { output?: AgentEvent };
      const event: AgentEvent =
        "output" in parsed ? (parsed.output ?? {}) : (parsed as AgentEvent);
      const text = event.content?.parts?.find((part) => part.text?.trim())?.text;
      if (text) return text.trim();
    } catch {
      // Vertex streams newline-delimited events; ignore malformed lines.
    }
  }
  return null;
}

async function createSession(base: string, resourceId: string, userId: string, token: string) {
  const response = await fetch(`${base}/reasoningEngines/${resourceId}/sessions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Vertex session failed (${response.status}).`);
  const data = (await response.json()) as { name?: string; response?: { name?: string } };
  const name = data.response?.name ?? data.name;
  const sessionId = name?.split("/sessions/")[1]?.split("/")[0];
  if (!sessionId) throw new Error("Vertex returned an invalid session.");
  return sessionId;
}

export async function runAndreaAgent(params: {
  message: string;
  userId: string;
  sessionId: string | null;
}) {
  const project = requiredEnv("GOOGLE_CLOUD_PROJECT");
  const location = requiredEnv("GOOGLE_CLOUD_LOCATION");
  const resourceId = requiredEnv("GOOGLE_AGENT_RESOURCE_ID");
  const token = await getGoogleAccessToken(["https://www.googleapis.com/auth/cloud-platform"]);
  const base = `https://${location}-aiplatform.googleapis.com/v1beta1/projects/${project}/locations/${location}`;
  const sessionId = params.sessionId ?? (await createSession(base, resourceId, params.userId, token));
  const endpoint = `${base}/reasoningEngines/${resourceId}:streamQuery`;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { message: params.message, user_id: params.userId, session_id: sessionId },
        class_method: "stream_query",
      }),
      cache: "no-store",
    });
    const body = await response.text();
    const reply = response.ok ? parseReply(body) : null;
    if (reply) return { reply, sessionId };
    if (response.status !== 429 || attempt === RETRY_DELAYS.length) {
      throw new Error(`Vertex agent unavailable (${response.status}).`);
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
  }
  throw new Error("Vertex agent exhausted retries.");
}
