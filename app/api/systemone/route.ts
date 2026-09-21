import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_RUNS = 5;
const MAX_TEXT_LEN = 8000;
const UPSTREAM_TIMEOUT_MS = 30_000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const userId = session.user.id;

  // Check user plan
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isPro = user?.plan === "pro";

  // Count existing runs
  const runCount = await prisma.usageRun.count({ where: { userId } });
  if (!isPro && runCount >= FREE_RUNS) {
    return NextResponse.json(
      { error: `You've used all ${FREE_RUNS} free runs. Subscribe to continue.`, code: "FREE_RUNS_EXHAUSTED" },
      { status: 403 }
    );
  }

  const apiKey = process.env.JEV_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "JEV_AI_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const state = typeof b.state === "string" ? b.state.trim() : "";
  if (!state) {
    return NextResponse.json({ error: "Please enter some text to analyze." }, { status: 400 });
  }
  if (state.length > MAX_TEXT_LEN) {
    return NextResponse.json({ error: `Text too long. Max ${MAX_TEXT_LEN} characters.` }, { status: 400 });
  }
  if (!b.questions || typeof b.questions !== "object") {
    return NextResponse.json({ error: "No questions defined." }, { status: 400 });
  }

  // Build sanitized request
  const upstreamBody = {
    state,
    model: typeof b.model === "string" ? b.model : "jev-latest",
    questions: b.questions,
  };

  // Call upstream with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.typesafe.ai/v1/systemone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(upstreamBody),
      signal: controller.signal,
    });

    const data = await res.json();

    // Record usage only on successful upstream call
    if (res.ok) {
      await prisma.usageRun.create({
        data: {
          userId,
          scenario: state.slice(0, 100),
          stateLen: state.length,
          inputTokens: data.usage?.input_tokens ?? null,
          outputTokens: data.usage?.output_tokens ?? null,
        },
      });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "The model took too long to respond. Please try again." }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
