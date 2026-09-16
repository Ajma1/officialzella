import { Resend } from "resend";

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
