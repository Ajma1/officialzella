-- Product.sku: human-readable inventory code. Backfill existing rows with
-- their id (unique already) since they're being retired, not deleted.
ALTER TABLE "Product" ADD COLUMN "sku" TEXT;
UPDATE "Product" SET "sku" = "id" WHERE "sku" IS NULL;
ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL;
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- Order.discountCents: pair-bundle savings folded into totalCents, tracked
-- separately for receipts/admin display.
ALTER TABLE "Order" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;

-- OrderItem.pairGroupId: groups the shirt+trouser rows of one pair purchase.
ALTER TABLE "OrderItem" ADD COLUMN "pairGroupId" TEXT;
CREATE INDEX "OrderItem_pairGroupId_idx" ON "OrderItem"("pairGroupId");
