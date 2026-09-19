-- Correction to the previous migration: CustomerSession.customerId is a
-- foreign key with onDelete: Cascade. Its index isn't dead weight just
-- because no application query filters by it directly — Postgres needs it
-- to efficiently find rows to cascade-delete when a Customer is removed,
-- without it every Customer delete does a full table scan of
-- CustomerSession. Restoring it; only OrderItem.pairGroupId (a plain
-- column, not a foreign key) was genuinely unused.
CREATE INDEX IF NOT EXISTS "CustomerSession_customerId_idx" ON "public"."CustomerSession" ("customerId");
