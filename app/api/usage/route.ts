import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authed: false, plan: "free", credits: 0, totalRemaining: 0 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ authed: false, plan: "free", credits: 0, totalRemaining: 0 });
  }

  return NextResponse.json({
    authed: true,
    plan: user.plan,
    credits: user.credits,
    totalRemaining: user.credits,
  });
}
