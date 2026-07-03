-- SAML SSO support on User:
--   passwordHash becomes optional (SAML-only accounts have no password)
--   eppn (eduPersonPrincipalName) identifies the SSO user, unique when set

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN "eppn" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_eppn_key" ON "User"("eppn");
