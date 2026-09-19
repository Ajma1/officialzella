import { z } from "zod";

// PLACEHOLDER — confirm the full list of shipping destinations (PLACEHOLDER_DATA.md).
export const COUNTRIES = ["Pakistan"] as const;

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .regex(/^[0-9+\-()\s]+$/, "Enter a valid phone number");

const whatsapp = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\+923\d{9}$/.test(v), {
    message: "Enter a valid WhatsApp number, e.g. +923001234567",
  });

export const checkoutSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    phone,
    whatsapp,
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    line1: z.string().trim().min(3, "Enter your street address"),
    line2: z.string().trim().optional(),
    city: z.string().trim().min(2, "Enter your city"),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.enum(COUNTRIES, { message: "Choose a country" }),
    notes: z.string().trim().max(500, "Keep notes under 500 characters").optional(),
    shipToDifferent: z.boolean().optional(),
    recipientName: z.string().trim().optional(),
  })
  .refine(
    (d) => !d.shipToDifferent || (d.recipientName?.length ?? 0) >= 2,
    { message: "Enter the recipient's name", path: ["recipientName"] },
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;
