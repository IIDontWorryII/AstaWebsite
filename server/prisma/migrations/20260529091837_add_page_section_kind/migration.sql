/*
  Warnings:

  - Added the required column `kind` to the `PageSection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PageSectionKind" AS ENUM ('INFO', 'REFERAT', 'MITGLIEDER', 'FREEFORM');

-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "kind" "PageSectionKind" NOT NULL;
