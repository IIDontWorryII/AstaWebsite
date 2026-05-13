// server/auth/passwords.test.ts

import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./passwords.js";

describe("hashPassword", () => {
  it("returns a bcrypt-shaped string starting with $2", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });

  it("produces a different hash each call (random salt)", async () => {
    const a = await hashPassword("hunter2");
    const b = await hashPassword("hunter2");
    expect(a).not.toBe(b);
  });
});

describe("verifyPassword", () => {
  it("returns true for the original password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
  });

  it("returns false for the wrong password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("hunter3", hash)).toBe(false);
  });
});
