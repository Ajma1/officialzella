"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendLoginPin } from "@/lib/email";
import { createSession, destroySession } from "@/lib/customer/session";
import {
  generatePin,
  hashPin,
  pinExpiresAt,
  verifyPinHash,
  MAX_ATTEMPTS,
  REQUEST_COOLDOWN_MS,
  REQUEST_WINDOW_MS,
  MAX_REQUESTS_PER_WINDOW,
} from "@/lib/customer/pin";

const emailSchema = z.string().trim().toLowerCase().email();

export type RequestPinState =
  | { ok: true; email: string }
  | { ok: false; error: string }
  | undefined;

export async function requestPin(
  _prev: RequestPinState,
  formData: FormData,
): Promise<RequestPinState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  const email = parsed.data;
  // Same response whether or not the email is known — never reveal that.
  const generic: RequestPinState = { ok: true, email };

  const customer = await prisma.customer.upsert({
    where: { email },
    create: { email },
    update: {},
  });

  const windowStart = new Date(Date.now() - REQUEST_WINDOW_MS);
  const recent = await prisma.loginPin.findMany({
    where: { customerId: customer.id, createdAt: { gte: windowStart } },
    orderBy: { createdAt: "desc" },
  });

  if (recent.length > 0 && Date.now() - recent[0].createdAt.getTime() < REQUEST_COOLDOWN_MS) {
    return generic; // silently absorb — don't tell an attacker they hit a limiter
  }
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return generic;
  }

  const pin = generatePin();
  await prisma.loginPin.create({
    data: {
      customerId: customer.id,
      codeHash: hashPin(pin),
      expiresAt: pinExpiresAt(),
    },
  });

  await sendLoginPin(email, pin);
  return generic;
}

export type VerifyPinState =
  | { ok: true; email: string }
  | { ok: false; error: string }
  | undefined;

export async function verifyPin(
  _prev: VerifyPinState,
  formData: FormData,
): Promise<VerifyPinState> {
  const emailParsed = emailSchema.safeParse(formData.get("email"));
  const code = String(formData.get("code") ?? "").trim();
  if (!emailParsed.success || !/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the 6-digit code from your email." };
  }
  const email = emailParsed.data;

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) return { ok: false, error: "Incorrect or expired code." };

  const pin = await prisma.loginPin.findFirst({
    where: { customerId: customer.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (
    !pin ||
    pin.expiresAt < new Date() ||
    pin.attempts >= MAX_ATTEMPTS ||
    !verifyPinHash(code, pin.codeHash)
  ) {
    if (pin && pin.attempts < MAX_ATTEMPTS) {
      await prisma.loginPin.update({
        where: { id: pin.id },
        data: { attempts: { increment: 1 } },
      });
    }
    return { ok: false, error: "Incorrect or expired code." };
  }

  await prisma.loginPin.update({
    where: { id: pin.id },
    data: { consumedAt: new Date() },
  });

  // Backfill: link any pre-existing guest orders placed under this email,
  // now that the email is proven owned by this customer.
  await prisma.order.updateMany({
    where: { customerEmail: { equals: email, mode: "insensitive" }, customerId: null },
    data: { customerId: customer.id },
  });

  await createSession(customer.id);
  return { ok: true, email };
}

export async function signOut(): Promise<void> {
  await destroySession();
}
