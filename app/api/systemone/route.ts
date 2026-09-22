import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_RUNS = 5;
const PRO_MONTHLY_RUNS = 1000;
const MAX_TEXT_LEN = 50000;
const UPSTREAM_TIMEOUT_MS = 30_000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user and check if monthly reset is needed
  const now = new Date();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Reset monthly quota if a new month has started
  let monthlyRunsUsed = user.monthlyRunsUsed;
  const resetAt = user.monthlyResetAt;
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    monthlyRunsUsed = 0;
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyRunsUsed: 0, monthlyResetAt: now },
    });
  }

  // Determine which quota to consume
  const isPro = user.plan === "pro" && (!user.subscriptionEndsAt || user.subscriptionEndsAt > now);
  const totalFreeRuns = await prisma.usageRun.count({ where: { userId } });

  let quotaType: "pro_monthly" | "credits" | "free" | null = null;

  if (isPro && monthlyRunsUsed < PRO_MONTHLY_RUNS) {
    quotaType = "pro_monthly";
  } else if (user.credits > 0) {
    quotaType = "credits";
  } else if (totalFreeRuns < FREE_RUNS) {
    quotaType = "free";
  } else {
    return NextResponse.json(
      { error: "You've run out of runs. Upgrade to Pro or buy credits.", code: "QUOTA_EXHAUSTED" },
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

      // Deduct from the appropriate quota
      if (quotaType === "pro_monthly") {
        await prisma.user.update({
          where: { id: userId },
          data: { monthlyRunsUsed: { increment: 1 } },
        });
      } else if (quotaType === "credits") {
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: 1 } },
        });
      }
      // free runs are counted by usageRun.count, no deduction needed
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
