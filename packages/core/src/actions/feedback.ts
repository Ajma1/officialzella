"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@zella/db";
import { isRateLimited } from "./rate-limit";

// ponytail: process-local, per-instance rate limiting — resets on
// redeploy/cold-start, and doesn't share state across serverless
// instances. Fine for a single-region low-traffic feedback form; upgrade
// to a shared store (e.g. Upstash Redis) only if abuse actually shows up.
const RATE_LIMIT_WINDOW_MS = 60_000;
const lastSubmissionByIp = new Map<string, number>();

const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5, "Choose a rating."),
  name: z.string().trim().max(80, "Keep your name under 80 characters.").optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  orderNumber: z.string().trim().max(40, "That doesn't look like an order number.").optional(),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more (at least 10 characters).")
    .max(1000, "Keep it under 1000 characters."),
});

export type SubmitFeedbackState =
  | { ok: true }
  | { ok: false; fieldErrors?: Record<string, string>; error?: string }
  | undefined;

/** Public, unauthenticated write — a trust boundary. Guards: a honeypot
 *  field (real users never see or fill it in — hidden via CSS on the
 *  form; bots often do), a per-IP cooldown, and field validation. A
 *  honeypot trip or a rate-limit hit returns the SAME generic success
 *  the real path returns — same idiom as requestPin's cooldown
 *  absorption in customer-auth.ts, so nothing ever learns which defense
 *  it hit. */
export async function submitFeedback(
  _prev: SubmitFeedbackState,
  formData: FormData,
): Promise<SubmitFeedbackState> {
  const generic: SubmitFeedbackState = { ok: true };

  if (String(formData.get("companyWebsite") ?? "").trim() !== "") {
    return generic;
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const lastSubmission = lastSubmissionByIp.get(ip);
  if (isRateLimited(Date.now(), lastSubmission, RATE_LIMIT_WINDOW_MS)) {
    return generic;
  }

  const parsed = feedbackSchema.safeParse({
    rating: formData.get("rating"),
    name: formData.get("name") ?? undefined,
    email: formData.get("email") ?? undefined,
    orderNumber: formData.get("orderNumber") ?? undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  await prisma.feedback.create({
    data: {
      rating: parsed.data.rating,
      name: parsed.data.name || null,
      email: parsed.data.email || null,
      orderNumber: parsed.data.orderNumber || null,
      message: parsed.data.message,
    },
  });

  lastSubmissionByIp.set(ip, Date.now());

  return generic;
}
