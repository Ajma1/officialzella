# Customer email-PIN login — design spec

Date: 2026-09-16

## Problem

Checkout is currently guest-only with an optional, unverified email. There is
no way for a customer to see their order history or take any action on an
order after placing it. This adds a passwordless customer identity: verify
an email with a one-time PIN at checkout, then use that same PIN flow to log
back in and see order history / cancel a pending order.

This is entirely separate from Supabase Auth (which continues to gate only
`/admin`). Customers never become Supabase-authenticated users, so this
feature cannot affect admin access control.

## Data model

```prisma
model Customer {
  id        String            @id @default(cuid())
  email     String            @unique
  name      String
  createdAt DateTime          @default(now())
  orders    Order[]
  pins      LoginPin[]
  sessions  CustomerSession[]
}

model LoginPin {
  id         String    @id @default(cuid())
  customer   Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  customerId String
  codeHash   String
  expiresAt  DateTime
  attempts   Int       @default(0)
  consumedAt DateTime?
  createdAt  DateTime  @default(now())

  @@index([customerId])
}

model CustomerSession {
  id         String   @id @default(cuid())
  tokenHash  String   @unique
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  customerId String
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([customerId])
}
```

`Order` gains a nullable `customerId String?` + relation. `customerEmail`
becomes effectively required for new orders (enforced at the checkout schema
/ action level, not a DB NOT NULL, to avoid breaking historical rows).

**Backfill on first verification:** when a `Customer` row is created for an
email that doesn't exist yet, link any existing `Order` rows where
`customerEmail` matches (case-insensitive) by setting their `customerId`.
This surfaces pre-existing guest orders in the new account history.

## PIN mechanics

- 6-digit numeric, `crypto.randomInt(0, 1_000_000)` zero-padded.
- Stored as `sha256(pin + PIN_PEPPER)` — `PIN_PEPPER` is a new server-only
  env secret. Raw PIN is never persisted.
- Verification compares hashes with `crypto.timingSafeEqual`.
- Expiry: 10 minutes from issuance.
- Single-use: `consumedAt` set on success; consumed or expired pins always
  rejected.
- Attempt limit: 5 wrong guesses invalidates the pin (further attempts fail
  even with the right code — caller must request a new one).
- Rate limits per email: max 1 request per 60 seconds, max 3 requests per
  15-minute window. Both checked against `LoginPin.createdAt` for that
  customer — no extra table needed.
- Enumeration resistance: requesting a pin always responds identically
  ("check your email") regardless of whether the `Customer` row already
  existed; it's created lazily on first request.

## Sessions

- On successful verify: generate a random 32-byte token
  (`crypto.randomBytes(32).toString("hex")`). Set it as an `httpOnly`,
  `Secure` (in production), `SameSite=Lax` cookie `zella_session`, 24h
  expiry.
- Only `sha256(token)` is stored in `CustomerSession.tokenHash` — a DB read
  can't be replayed as a cookie.
- Sign-out deletes the `CustomerSession` row server-side and clears the
  cookie (real revocation).
- Every `/account/*` page and server action re-derives the customer from the
  cookie server-side each time; never trusts a client-supplied customer id.

## Checkout integration

- `CheckoutForm`'s email field gains a "Send code" step: enter email → send
  → inline 6-digit input appears → verify → field locks as verified and a
  session cookie is set.
- `placeOrder` requires a valid `CustomerSession` whose customer's email
  matches the submitted email; without one it fails with a field error
  telling the customer to verify their email.
- `requestPin` / `verifyPin` server actions are shared verbatim between
  checkout and the standalone login page — one code path, not two.

## Account surface

- `/account/login` — email → send code → verify → redirect to `/account`.
- `/account` — the signed-in customer's orders, newest first: order number,
  date, items, status, total, linking to a detail view.
- **Cancel order**: visible only while `status === "PENDING"`. Server action
  loads the order filtered by *both* `id` and `customerId = session's
  customer` in the same query (a customer can never act on another
  customer's order by guessing an id), re-checks status is still `PENDING`
  (race-safe against admin changing it concurrently), then sets `CANCELLED`.

## Email delivery

- New dependency: `resend`.
- `src/lib/email.ts` — `sendLoginPin(email, pin)`, thin wrapper around the
  Resend SDK.
- New env vars: `RESEND_API_KEY`, `EMAIL_FROM`. Documented as
  placeholder-requiring in `PLACEHOLDER_DATA.md` / `README.md` — the app
  must run with these unset in dev (log the pin to the server console as a
  fallback) since a real key isn't available yet.

## Explicitly out of scope (skipped, not forgotten)

- No cron/cleanup for expired `LoginPin` / `CustomerSession` rows — tables
  stay small, expired rows are filtered by `expiresAt` in every query. Add a
  cleanup job only if this ever measurably matters.
- No "edit shipping address" or other order mutation beyond cancel.
- No password option — PIN-only by design.

## Testing

Vitest, following this repo's existing pattern of hitting the real dev DB:
- PIN issuance: creates/reuses `Customer`, hashes correctly, enforces the
  60s cooldown and 3-per-15-min cap.
- PIN verify: correct code passes and consumes it; wrong code increments
  `attempts` and locks out at 5; expired code rejected.
- Session: valid token resolves the right customer; unknown/tampered token
  resolves none; expired session rejected.
- Authorization boundary: customer A's session cannot fetch or cancel
  customer B's order.
- `placeOrder`: rejects when no verified session matches the submitted
  email.
