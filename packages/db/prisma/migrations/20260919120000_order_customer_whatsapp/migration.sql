-- Optional WhatsApp number for delivery coordination, separate from the
-- required customerPhone (which may be a landline).
ALTER TABLE "public"."Order" ADD COLUMN "customerWhatsapp" TEXT;
