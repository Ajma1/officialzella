import { describe, it, expect } from "vitest";
import { checkoutSchema } from "@/lib/checkout/schema";

const valid = {
  fullName: "Ava Lin",
  phone: "+1 202 555 0142",
  email: "ava@example.com",
  line1: "12 Cotton Lane",
  city: "Portland",
  country: "Pakistan",
};

describe("checkoutSchema", () => {
  it("accepts a valid payload", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a missing email", () => {
    const { email, ...rest } = valid;
    void email;
    expect(checkoutSchema.safeParse(rest).success).toBe(true);
  });

  it("accepts an empty-string email", () => {
    expect(checkoutSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
  });

  it("rejects a bad email", () => {
    expect(checkoutSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
  });

  it("rejects a missing full name", () => {
    const { fullName, ...rest } = valid;
    void fullName;
    expect(checkoutSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects a country outside the allow-list", () => {
    expect(checkoutSchema.safeParse({ ...valid, country: "Narnia" }).success).toBe(false);
  });

  it("requires a recipient name when shipping to someone else", () => {
    expect(
      checkoutSchema.safeParse({ ...valid, shipToDifferent: true }).success,
    ).toBe(false);
    expect(
      checkoutSchema.safeParse({
        ...valid,
        shipToDifferent: true,
        recipientName: "Mia",
      }).success,
    ).toBe(true);
  });
});
