import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { WaffoPancake, WaffoPancakeError } from "@waffo/pancake-ts";

const client = new WaffoPancake({
  merchantId: process.env.WAFFO_MERCHANT_ID!,
  privateKey: process.env.WAFFO_PRIVATE_KEY!,
});

const ALLOWED_PRODUCT_IDS = [
  "PROD_4NE6mzBEIlp3qttwrY7SXz", // Starter Pack $4.9 = 500 credits
  "PROD_4Qj3FxHBiSgC3WiwLxEZmh", // Pro Pack $9.9 = 1000 credits
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    if (!ALLOWED_PRODUCT_IDS.includes(productId)) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const checkoutSession = await client.checkout.createSession({
      productId,
      currency: "USD",
      language: "en",
      buyerEmail: session.user.email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://jev-ai.xyz"}/success`,
      metadata: {
        userId: session.user.id || "",
        email: session.user.email,
        productId,
      },
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.checkoutUrl });
  } catch (error) {
    if (error instanceof WaffoPancakeError) {
      console.error("[Checkout] Waffo error:", error.status, JSON.stringify(error.errors));
      return NextResponse.json({ error: error.errors?.[0]?.message || "Checkout failed" }, { status: error.status || 500 });
    }
    console.error("[Checkout] Unexpected error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
