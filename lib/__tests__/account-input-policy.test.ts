import { describe, expect, it } from "vitest";
import {
  emailAddressValidationError,
  normaliseEmailAddress,
} from "@/lib/email-address";
import { passwordValidationError } from "@/lib/password-policy";

describe("email address policy", () => {
  it("normalises before storage and lookup", () => {
    expect(normaliseEmailAddress("  MAX@Example.COM ")).toBe("max@example.com");
  });

  it.each([
    "x",
    "a@@b.de",
    "a b@example.com",
    "@example.com",
    ".a@example.com",
    "a..b@example.com",
    "a@-example.com",
    "a@example..com",
  ])(
    "rejects invalid address %s",
    (email) => expect(emailAddressValidationError(email)).not.toBeNull()
  );
});

describe("password policy", () => {
  it("rejects values bcrypt would truncate after 72 UTF-8 bytes", () => {
    expect(passwordValidationError("ä".repeat(37))).toMatch(/72 UTF-8-Bytes/);
  });

  it("accepts a password at the bcrypt boundary", () => {
    expect(passwordValidationError("a".repeat(72))).toBeNull();
  });
});
