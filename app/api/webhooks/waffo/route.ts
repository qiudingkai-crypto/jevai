import { NextResponse } from "next/server";
import { verifyWebhook, WebhookEventType } from "@waffo/pancake-ts";
import { prisma } from "@/lib/prisma";

// Product IDs from Waffo dashboard
const CREDIT_PACKS: Record<string, number> = {
  "PROD_4FPBGerWxwmKRtC7G4fICu": 500,  // Starter Pack $4.9
  "PROD_4kF76T5Y1jfdvehOHJ8OuW": 1000, // Pro Pack $9.9
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-waffo-signature");

  try {
    const event = verifyWebhook(body, signature || "");
    console.log(`[Waffo] Event: ${event.eventType}`, JSON.stringify(event.data));

    switch (event.eventType) {
      case WebhookEventType.OrderCompleted: {
        const email = event.data.buyerEmail;
        if (!email) break;

        const productId = (event.data as any).productId || (event.data as any).items?.[0]?.productId;

        if (productId && CREDIT_PACKS[productId]) {
          const credits = CREDIT_PACKS[productId];
          await prisma.user.updateMany({
            where: { email },
            data: { credits: { increment: credits } },
          });
          console.log(`[Waffo] Added ${credits} credits to ${email}`);
        } else {
          console.log(`[Waffo] Unknown product: ${productId}`);
        }
        break;
      }

      case WebhookEventType.RefundSucceeded: {
        console.log(`[Waffo] Refund: ${event.data.amount} ${event.data.currency}`);
        // TODO: deduct credits on refund if needed
        break;
      }

      default:
        console.log(`[Waffo] Unhandled event: ${event.eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Waffo] Webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 401 });
  }
}
