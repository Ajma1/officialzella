import { Resend } from "resend";
import { formatPrice } from "./format";

/** PLACEHOLDER fallback: without a real RESEND_API_KEY, the pin is logged
 *  instead of emailed so checkout/login stay usable in local dev. */
export async function sendLoginPin(email: string, pin: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[dev] login pin for ${email}: ${pin}`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Zella <onboarding@resend.dev>",
    to: email,
    subject: `Your Zella login code: ${pin}`,
    text: `Your Zella login code is ${pin}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
}

export type AdminOrderEmailKind = "placed" | "cancelled_by_customer" | "cancelled_by_admin";

export interface AdminOrderEmailOrder {
  orderNumber: string;
  customerName: string;
  totalCents: number;
}

const ADMIN_EMAIL_LABEL: Record<AdminOrderEmailKind, string> = {
  placed: "New order",
  cancelled_by_customer: "Order cancelled by customer",
  cancelled_by_admin: "Order cancelled",
};

/** Notifies ADMIN_NOTIFY_EMAIL of an order event. Never throws — a
 *  notification failure (missing env vars, a Resend error) must never
 *  fail the checkout/cancel/status-update action that triggered it. */
export async function sendAdminOrderEmail(
  kind: AdminOrderEmailKind,
  order: AdminOrderEmailOrder,
): Promise<void> {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to) {
    console.log(
      `[email] ADMIN_NOTIFY_EMAIL not set — skipping "${kind}" notification for ${order.orderNumber}`,
    );
    return;
  }

  const label = ADMIN_EMAIL_LABEL[kind];
  const subject = `${label}: ${order.orderNumber}`;
  const text = `${label}\n\nOrder: ${order.orderNumber}\nCustomer: ${order.customerName}\nTotal: ${formatPrice(order.totalCents)}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[dev] admin order email (${kind}) for ${order.orderNumber}: ${text}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Zella <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
  } catch (e) {
    console.error(`[email] failed to send "${kind}" notification for ${order.orderNumber}`, e);
  }
}
