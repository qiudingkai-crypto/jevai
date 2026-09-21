import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_RUNS = 5;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const userId = session.user.id;

  // Count existing runs
  const runCount = await prisma.usageRun.count({ where: { userId } });
  if (runCount >= FREE_RUNS) {
    return NextResponse.json(
      { error: `You've used all ${FREE_RUNS} free runs. Subscribe to continue.` },
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

  const body = await request.json();

  try {
    const res = await fetch("https://jev-ai.pro/api/v1/systemone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // Record usage
    await prisma.usageRun.create({
      data: {
        userId,
        scenario: body.state?.slice(0, 100) || "unknown",
        stateLen: (body.state || "").length,
        inputTokens: data.usage?.input_tokens ?? null,
        outputTokens: data.usage?.output_tokens ?? null,
      },
    });

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
