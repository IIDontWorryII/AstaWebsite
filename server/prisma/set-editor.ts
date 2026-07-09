// server/prisma/set-editor.ts
//
// Create or update an EDITOR account with a given email + password (hashed).
// Use this to provision the AStA's editor login instead of a seeded default.
//
//   npm run set-editor -- editor@asta-rac.de "a-strong-password"
//
// (Note: the password appears in your shell history — clear it afterwards if
// that matters, or change the password in the app once logged in.)

import "dotenv/config";
import { hashPassword } from "../auth/passwords.js";
import { createPrismaClient } from "../db.js";

const prisma = createPrismaClient();

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: npm run set-editor -- <email> "<password>"');
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "EDITOR" },
    create: {
      email,
      passwordHash,
      displayName: email.split("@")[0],
      role: "EDITOR",
    },
  });
  console.log(`Editor account ready: ${user.email} (role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error("Failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
