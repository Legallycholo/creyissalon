import { GoogleAuth, type OAuth2Client } from "google-auth-library";

let cachedAuth: GoogleAuth<OAuth2Client> | null = null;

function serviceAccountCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return undefined;
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function getGoogleAccessToken(scopes: string[]) {
  cachedAuth ??= new GoogleAuth({
    credentials: serviceAccountCredentials(),
    scopes,
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
  });
  const client = await cachedAuth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Failed to acquire Google access token.");
  return token.token;
}
