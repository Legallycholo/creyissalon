import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { runAndreaAgent } from "@/lib/andrea-agent-runtime";
import { runLocalAndrea } from "@/lib/andrea";
import { isAndreaEnabled } from "@/lib/andrea-config";

type ChatRequest = {
  message?: unknown;
  sessionId?: unknown;
  state?: unknown;
  locale?: unknown;
  pagePath?: unknown;
};

export async function POST(request: Request) {
  if (!isAndreaEnabled()) {
    return NextResponse.json({ error: "Chat is not enabled." }, { status: 404 });
  }
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const cookieStore = await cookies();
  let userId = cookieStore.get("andrea_chat_user")?.value;
  if (!userId) {
    userId = randomUUID();
    cookieStore.set("andrea_chat_user", userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  const provider = process.env.ANDREA_CHAT_PROVIDER?.trim().toLowerCase() || "local";
  const hasLocalState = Boolean(body.state && typeof body.state === "object");
  if (provider === "google" && !hasLocalState) {
    try {
      return NextResponse.json(await runAndreaAgent({ message, userId, sessionId }));
    } catch (error) {
      console.error("[api/chat] Google agent unavailable; using local Andrea", error);
    }
  }

  return NextResponse.json(
    runLocalAndrea({
      message,
      state: body.state,
      locale: body.locale,
      pagePath: body.pagePath,
    }),
  );
}
