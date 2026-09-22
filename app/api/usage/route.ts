import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_RUNS = 5;
const PRO_MONTHLY_RUNS = 1000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authed: false, remaining: FREE_RUNS, plan: "free", credits: 0 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ authed: false, remaining: FREE_RUNS, plan: "free", credits: 0 });
  }

  const now = new Date();
  const isPro = user.plan === "pro" && (!user.subscriptionEndsAt || user.subscriptionEndsAt > now);
  const freeRemaining = Math.max(0, FREE_RUNS - user.freeRunsUsed);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const proRemaining = isPro
    ? user.monthlyResetAt < monthStart ? PRO_MONTHLY_RUNS : Math.max(0, PRO_MONTHLY_RUNS - user.monthlyRunsUsed)
    : 0;

  return NextResponse.json({
    authed: true,
    plan: isPro ? "pro" : "free",
    freeRemaining,
    proRemaining,
    credits: user.credits,
    totalRemaining: freeRemaining + proRemaining + user.credits,
  });
}
