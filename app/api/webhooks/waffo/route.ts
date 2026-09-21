import { NextResponse } from "next/server";
import { verifyWebhook, WebhookEventType } from "@waffo/pancake-ts";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-waffo-signature");

  try {
    const event = verifyWebhook(body, signature || "");

    switch (event.eventType) {
      case WebhookEventType.OrderCompleted:
        console.log(`[Waffo] Order completed: ${event.data.orderId}`);
        // Mark user as pro in DB
        if (event.data.buyerEmail) {
          await prisma.user.updateMany({
            where: { email: event.data.buyerEmail },
            data: { plan: "pro" },
          });
        }
        break;

      case WebhookEventType.SubscriptionActivated:
        console.log(`[Waffo] Subscription activated: ${event.data.buyerEmail}`);
        if (event.data.buyerEmail) {
          await prisma.user.updateMany({
            where: { email: event.data.buyerEmail },
            data: { plan: "pro" },
          });
        }
        break;

      case WebhookEventType.SubscriptionCanceled:
        console.log(`[Waffo] Subscription canceled: ${event.data.buyerEmail}`);
        if (event.data.buyerEmail) {
          await prisma.user.updateMany({
            where: { email: event.data.buyerEmail },
            data: { plan: "free" },
          });
        }
        break;

      case WebhookEventType.RefundSucceeded:
        console.log(`[Waffo] Refund: ${event.data.amount} ${event.data.currency}`);
        if (event.data.buyerEmail) {
          await prisma.user.updateMany({
            where: { email: event.data.buyerEmail },
            data: { plan: "free" },
          });
        }
        break;

      default:
        console.log(`[Waffo] Unhandled event: ${event.eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Waffo] Webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 401 });
  }
}
