-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PageSectionKind" ADD VALUE 'STEP';
ALTER TYPE "PageSectionKind" ADD VALUE 'FAQ';

-- CreateTable
CREATE TABLE "ErstiInfo" (
    "id" TEXT NOT NULL DEFAULT 'ersti',
    "pruefungsanmeldung" TEXT,
    "klausurenphase" TEXT,
    "pruefungstermineMitUrl" TEXT,
    "pruefungstermineWisoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ErstiInfo_pkey" PRIMARY KEY ("id")
);
