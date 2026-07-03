// server/auth/saml.ts
//
// SAML 2.0 Service Provider (SP) configuration for "log in with HS Koblenz".
// Slice 1 only needs to describe OUR side and emit SP metadata (the XML we
// hand to the IdP admin) — no IdP details required yet. The login/ACS flow
// (Slice 2) will add the IdP entryPoint + cert from env.
//
// Secrets come from env (see .env.example):
//   SAML_SP_ENTITY_ID   our SP entityID (a URI)
//   SAML_SP_ACS_URL     where the IdP posts the assertion back
//   SAML_SP_SLO_URL     single-logout endpoint (optional)
//   SAML_SP_CERT[_FILE] our public certificate (inline PEM or a file path)
//   SAML_SP_KEY_FILE    our private key file path (used later, in Slice 2)

import fs from "node:fs";
import { generateServiceProviderMetadata } from "@node-saml/node-saml";

export const SP_ENTITY_ID =
  process.env.SAML_SP_ENTITY_ID ?? "https://asta-rac.de/saml/metadata";
export const SP_ACS_URL =
  process.env.SAML_SP_ACS_URL ?? "https://asta-rac.de/api/auth/saml/acs";
export const SP_SLO_URL =
  process.env.SAML_SP_SLO_URL ?? "https://asta-rac.de/api/auth/saml/slo";

/** Read a file, returning null if the path is unset or unreadable. */
function readMaybe(path: string | undefined): string | null {
  if (!path) return null;
  try {
    return fs.readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/** Strip PEM armor + whitespace so node-saml gets the bare base64 cert. */
function normalizeCert(pem: string | null): string | null {
  if (!pem) return null;
  const bare = pem
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");
  return bare || null;
}

// Our public SP certificate (for the metadata's signing/encryption
// KeyDescriptors). Missing during early dev is fine — metadata is then emitted
// without a KeyDescriptor; add the cert before sending it to the IdP admin.
const spPublicCert = normalizeCert(
  process.env.SAML_SP_CERT ?? readMaybe(process.env.SAML_SP_CERT_FILE),
);

/** Whether an SP certificate is configured (used to warn on the metadata route). */
export const hasSpCert = spPublicCert !== null;

/** Generate our SP metadata XML to hand to the IdP (HS Koblenz). */
export function getSpMetadata(): string {
  return generateServiceProviderMetadata({
    issuer: SP_ENTITY_ID,
    callbackUrl: SP_ACS_URL,
    logoutCallbackUrl: SP_SLO_URL,
    identifierFormat:
      "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
    wantAssertionsSigned: true,
    // Same cert advertised for both signing and encryption.
    publicCerts: spPublicCert,
    decryptionCert: spPublicCert,
  });
}
