import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_RUNS = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authed: false, remaining: FREE_RUNS, plan: "free" });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isPro = user?.plan === "pro";

  const runCount = await prisma.usageRun.count({ where: { userId: session.user.id } });
  return NextResponse.json({
    authed: true,
    plan: user?.plan || "free",
    used: runCount,
    remaining: isPro ? -1 : Math.max(0, FREE_RUNS - runCount),
    total: isPro ? -1 : FREE_RUNS,
  });
}
