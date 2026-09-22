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

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Only the first request in a UTC month resets the counter. Conditional
  // updates below reserve one run atomically before contacting the model.
  if (user.plan === "pro") {
    await prisma.user.updateMany({
      where: { id: userId, monthlyResetAt: { lt: monthStart } },
      data: { monthlyRunsUsed: 0, monthlyResetAt: now },
    });
  }

  let quotaType: "pro_monthly" | "credits" | "free" | null = null;
  if (user.plan === "pro") {
    const reserved = await prisma.user.updateMany({
      where: {
        id: userId,
        plan: "pro",
        OR: [{ subscriptionEndsAt: null }, { subscriptionEndsAt: { gt: now } }],
        monthlyResetAt: { gte: monthStart, lt: nextMonthStart },
        monthlyRunsUsed: { lt: PRO_MONTHLY_RUNS },
      },
      data: { monthlyRunsUsed: { increment: 1 } },
    });
    if (reserved.count) quotaType = "pro_monthly";
  }
  if (!quotaType) {
    const reserved = await prisma.user.updateMany({
      where: { id: userId, credits: { gt: 0 } },
      data: { credits: { decrement: 1 } },
    });
    if (reserved.count) quotaType = "credits";
  }
  if (!quotaType) {
    const reserved = await prisma.user.updateMany({
      where: { id: userId, freeRunsUsed: { lt: FREE_RUNS } },
      data: { freeRunsUsed: { increment: 1 } },
    });
    if (reserved.count) quotaType = "free";
  }
  if (!quotaType) {
    return NextResponse.json(
      { error: "You've run out of runs. Upgrade to Pro or buy credits.", code: "QUOTA_EXHAUSTED" },
      { status: 403 }
    );
  }

  // Call upstream with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let result: NextResponse;
  let completed = false;
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

      completed = true;
    }
    result = NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      result = NextResponse.json({ error: "The model took too long to respond. Please try again." }, { status: 504 });
    } else {
      console.error("[Jev] Model request or usage recording failed:", err);
      result = NextResponse.json({ error: "The request failed. Please try again." }, { status: 502 });
    }
  } finally {
    clearTimeout(timeout);
    if (!completed) {
      try {
        if (quotaType === "pro_monthly") {
          await prisma.user.updateMany({
            where: { id: userId, monthlyResetAt: { gte: monthStart, lt: nextMonthStart }, monthlyRunsUsed: { gt: 0 } },
            data: { monthlyRunsUsed: { decrement: 1 } },
          });
        } else if (quotaType === "credits") {
          await prisma.user.update({ where: { id: userId }, data: { credits: { increment: 1 } } });
        } else {
          await prisma.user.update({ where: { id: userId }, data: { freeRunsUsed: { decrement: 1 } } });
        }
      } catch (err) {
        console.error("[Jev] Failed to release a reserved run:", err);
        result = NextResponse.json({ error: "Quota reconciliation failed. Please contact support." }, { status: 500 });
      }
    }
  }
  return result;
}
