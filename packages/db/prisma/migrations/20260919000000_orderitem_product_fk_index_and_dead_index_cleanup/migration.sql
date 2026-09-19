-- Add missing covering index for OrderItem's productId foreign key
-- (flagged by Supabase's performance advisor: unindexed_foreign_keys).
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "public"."OrderItem" ("productId");

-- Drop indexes with no matching query pattern anywhere in the codebase.
-- CustomerSession lookups go through tokenHash only (see session.ts); no
-- code path filters by customerId. pairGroupId is only ever written
-- (place-order.ts), never queried by.
DROP INDEX IF EXISTS "public"."CustomerSession_customerId_idx";
DROP INDEX IF EXISTS "public"."OrderItem_pairGroupId_idx";
