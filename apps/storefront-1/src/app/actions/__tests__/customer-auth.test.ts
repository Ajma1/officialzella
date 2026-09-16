import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => import("@/test/cookie-jar"));
vi.mock("@/lib/email", () => ({ sendLoginPin: vi.fn() }));

import { requestPin, verifyPin, signOut } from "@/app/actions/customer-auth";
import { getSessionCustomer } from "@/lib/customer/session";
import { sendLoginPin } from "@/lib/email";
import { __resetCookieJar, __setCookie } from "@/test/cookie-jar";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

async function lastPin(): Promise<string> {
  const calls = vi.mocked(sendLoginPin).mock.calls;
  return calls[calls.length - 1][1];
}

const uniqueEmail = (tag: string) => `pin-${tag}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

beforeEach(() => {
  __resetCookieJar();
  vi.mocked(sendLoginPin).mockClear();
});

describe("requestPin", () => {
  it("creates a customer and emails a 6-digit pin", async () => {
    const email = uniqueEmail("issue");
    const res = await requestPin(undefined, form({ email }));
    expect(res).toEqual({ ok: true, email });
    expect(await lastPin()).toMatch(/^\d{6}$/);
  });

  it("absorbs a repeat request within the cooldown without sending again", async () => {
    const email = uniqueEmail("cooldown");
    await requestPin(undefined, form({ email }));
    const before = vi.mocked(sendLoginPin).mock.calls.length;
    const res = await requestPin(undefined, form({ email }));
    expect(res).toEqual({ ok: true, email });
    expect(vi.mocked(sendLoginPin).mock.calls.length).toBe(before);
  });

  it("rejects a malformed email", async () => {
    const res = await requestPin(undefined, form({ email: "not-an-email" }));
    expect(res?.ok).toBe(false);
  });
});

describe("verifyPin", () => {
  it("accepts the correct code, starts a session, and rejects reuse", async () => {
    const email = uniqueEmail("verify");
    await requestPin(undefined, form({ email }));
    const pin = await lastPin();

    const ok = await verifyPin(undefined, form({ email, code: pin }));
    expect(ok).toEqual({ ok: true, email });

    const customer = await getSessionCustomer();
    expect(customer?.email).toBe(email);

    const reuse = await verifyPin(undefined, form({ email, code: pin }));
    expect(reuse?.ok).toBe(false);
  });

  it("rejects a wrong code and locks out after 5 attempts, even with the right code after", async () => {
    const email = uniqueEmail("lockout");
    await requestPin(undefined, form({ email }));
    const pin = await lastPin();

    for (let i = 0; i < 5; i++) {
      const res = await verifyPin(undefined, form({ email, code: "000000" }));
      expect(res).toEqual({ ok: false, error: "Incorrect or expired code." });
    }

    const res = await verifyPin(undefined, form({ email, code: pin }));
    expect(res?.ok).toBe(false);
  });

  it("rejects an unknown email", async () => {
    const res = await verifyPin(
      undefined,
      form({ email: uniqueEmail("unknown"), code: "123456" }),
    );
    expect(res).toEqual({ ok: false, error: "Incorrect or expired code." });
  });
});

describe("session boundary", () => {
  it("signOut clears the session", async () => {
    const email = uniqueEmail("signout");
    await requestPin(undefined, form({ email }));
    const pin = await lastPin();
    await verifyPin(undefined, form({ email, code: pin }));
    expect((await getSessionCustomer())?.email).toBe(email);

    await signOut();
    expect(await getSessionCustomer()).toBeNull();
  });

  it("a tampered session token resolves no customer", async () => {
    const email = uniqueEmail("tamper");
    await requestPin(undefined, form({ email }));
    const pin = await lastPin();
    await verifyPin(undefined, form({ email, code: pin }));
    expect(await getSessionCustomer()).not.toBeNull();

    __setCookie("zella_session", "not-a-real-token");
    expect(await getSessionCustomer()).toBeNull();
  });
});
