// server/test/setup.ts
//
// Vitest setup — runs once before any test file is loaded. We inject
// dummy R2 environment variables so server/upload/storage.ts (which
// validates env on import) doesn't crash test boot.
//
// Tests that exercise actual upload behavior additionally vi.mock the
// storage module, so the dummy values are never used to make real
// network calls — they only have to be present.

process.env.R2_ENDPOINT ??= "https://test-endpoint.r2.cloudflarestorage.com";
process.env.R2_BUCKET ??= "test-bucket";
process.env.R2_ACCESS_KEY_ID ??= "test-access-key";
process.env.R2_SECRET_ACCESS_KEY ??= "test-secret-key";
process.env.R2_PUBLIC_URL ??= "https://test-public.r2.dev";
