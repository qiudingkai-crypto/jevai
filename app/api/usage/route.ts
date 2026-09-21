import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FREE_RUNS = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authed: false, remaining: FREE_RUNS });
  }

  const runCount = await prisma.usageRun.count({ where: { userId: session.user.id } });
  return NextResponse.json({
    authed: true,
    used: runCount,
    remaining: Math.max(0, FREE_RUNS - runCount),
    total: FREE_RUNS,
  });
}
