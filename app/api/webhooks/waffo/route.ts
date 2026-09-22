import { NextResponse } from "next/server";
import { verifyWebhook, WebhookEventType, type WebhookEventData } from "@waffo/pancake-ts";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Product IDs from Waffo dashboard
const CREDIT_PACKS: Record<string, number> = {
  "PROD_4FPBGerWxwmKRtC7G4fICu": 500,  // Starter Pack $4.9
  "PROD_4kF76T5Y1jfdvehOHJ8OuW": 1000, // Pro Pack $9.9
};

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-waffo-signature");

  let event;
  try {
    event = verifyWebhook<WebhookEventData>(body, signature || "");
  } catch {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  try {
    switch (event.eventType) {
      case WebhookEventType.OrderCompleted: {
        const { orderId, buyerEmail, orderMetadata } = event.data;
        const data = event.data as typeof event.data & {
          productId?: string;
          items?: Array<{ productId?: string }>;
        };
        // Metadata is supplied by our checkout session; retain compatibility
        // with earlier orders where Waffo included productId on the payload.
        const productId = orderMetadata?.productId || data.productId || data.items?.[0]?.productId;
        const credits = productId ? CREDIT_PACKS[productId] : undefined;

        if (!orderId || !event.storeId || !productId || !credits) {
          console.error("[Waffo] Missing order identity or recognized product", { orderId, productId });
          return NextResponse.json({ error: "Cannot identify credit purchase" }, { status: 422 });
        }
        const purchaseProductId = productId;

        const user = orderMetadata?.userId
          ? await prisma.user.findUnique({ where: { id: orderMetadata.userId } })
          : buyerEmail
            ? await prisma.user.findUnique({ where: { email: buyerEmail } })
            : null;
        // A buyer may use a different billing email. The signed checkout
        // metadata's userId takes precedence; email is only a legacy fallback.
        if (!user) {
          console.error("[Waffo] No matching user for completed order", { orderId });
          return NextResponse.json({ error: "Cannot identify purchaser" }, { status: 422 });
        }

        try {
          await prisma.$transaction(async (tx) => {
            await tx.creditPurchase.create({
              data: { storeId: event.storeId, orderId, productId: purchaseProductId, credits, userId: user.id },
            });
            await tx.user.update({
              where: { id: user.id },
              data: { credits: { increment: credits } },
            });
          });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            // The unique order key is inserted in the same transaction as the
            // credit increment, so a delivery retry cannot increment again.
            return NextResponse.json({ received: true, duplicate: true });
          }
          throw error;
        }
        console.log(`[Waffo] Credited order ${orderId}: ${credits} runs`);
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
    console.error("[Waffo] Failed to process verified webhook:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
