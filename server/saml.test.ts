// server/saml.test.ts
//
// Verifies the SP metadata endpoint emits valid SAML metadata XML. This is
// what we hand to the IdP (HS Koblenz) to register our Service Provider.

import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app.js";

describe("GET /saml/metadata", () => {
  it("returns SAML SP metadata XML with our entityID and ACS endpoint", async () => {
    const res = await request(app).get("/saml/metadata");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/xml/);
    expect(res.text).toContain("EntityDescriptor");
    expect(res.text).toContain("SPSSODescriptor");
    expect(res.text).toContain("AssertionConsumerService");
    expect(res.text).toContain("https://asta-rac.de/saml/metadata");
  });
});
