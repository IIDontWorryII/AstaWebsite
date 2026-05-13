// server/auth/tokens.test.ts
import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { signToken, verifyToken } from "./tokens.js";

const SAMPLE = { sub: "user-test", role: "EDITOR" as const };

describe("signToken", () => {
  it("returns a JWT-shaped string (3 dot-separated base64 sections)", () => {
    const token = signToken(SAMPLE);
    expect(token.split(".")).toHaveLength(3);
  });
});

describe("verifyToken", () => {
  it("round-trips a payload signed by signToken", () => {
    const token = signToken(SAMPLE);
    expect(verifyToken(token)).toEqual(SAMPLE);
  });

  it("strips iat/exp from the returned payload", () => {
    const token = signToken(SAMPLE);
    const result = verifyToken(token);
    expect(Object.keys(result).sort()).toEqual(["role", "sub"]);
  });

  it("throws on a tampered signature", () => {
    const token = signToken(SAMPLE);
    const tampered = token.slice(0, -2) + "xx"; // mangle the signature
    expect(() => verifyToken(tampered)).toThrow();
  });

  it("throws on an expired token", () => {
    // Manually sign with a 1-second expiry, then wait it out.
    // Faster: sign with a past expiry directly.
    const past = Math.floor(Date.now() / 1000) - 10;
    const expired = jwt.sign(
      { ...SAMPLE, exp: past },
      process.env.JWT_SECRET as string,
    );
    expect(() => verifyToken(expired)).toThrow(/expired/i);
  });
});
