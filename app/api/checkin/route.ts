import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 7-day onboarding reward (one-time, not recurring)
const REWARDS = [1, 1, 2, 2, 2, 3, 3];
const MAX_STREAK = 7;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const today = now.toDateString();
  const lastCheckIn = user.lastCheckInAt?.toDateString();
  const canCheckIn = today !== lastCheckIn && user.checkInStreak < MAX_STREAK;

  return NextResponse.json({
    canCheckIn,
    streak: user.checkInStreak,
    rewards: REWARDS,
    nextReward: canCheckIn ? REWARDS[user.checkInStreak] : 0,
    completed: user.checkInStreak >= MAX_STREAK,
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.checkInStreak >= MAX_STREAK) {
    return NextResponse.json({ error: "Welcome reward already completed" }, { status: 400 });
  }

  const now = new Date();
  const today = now.toDateString();
  const lastCheckIn = user.lastCheckInAt?.toDateString();

  if (today === lastCheckIn) {
    return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
  }

  // Determine streak: if yesterday, continue; else reset to 1
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isConsecutive = lastCheckIn === yesterday.toDateString();

  const streak = isConsecutive ? user.checkInStreak + 1 : 1;
  const reward = REWARDS[streak - 1];

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastCheckInAt: now,
      checkInStreak: streak,
      credits: { increment: reward },
    },
  });

  return NextResponse.json({
    reward,
    streak,
    cycleDay: streak,
  });
}
