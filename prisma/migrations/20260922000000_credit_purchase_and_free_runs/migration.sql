-- Existing usage records did not identify which quota paid for a run.
-- Start the separate free-run counter at zero so past purchased/pro runs
-- cannot incorrectly consume a user's free allowance.
ALTER TABLE "User" ADD COLUMN "freeRunsUsed" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "CreditPurchase" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreditPurchase_storeId_orderId_key" ON "CreditPurchase"("storeId", "orderId");
ALTER TABLE "CreditPurchase" ADD CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
