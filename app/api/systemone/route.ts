import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upstream error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
