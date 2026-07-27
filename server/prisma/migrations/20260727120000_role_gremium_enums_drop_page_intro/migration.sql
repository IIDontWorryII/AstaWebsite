-- AW-52: promote User.role and Protocol.gremium from free text to enums,
-- and drop the unused Page.intro column.
--
-- The `USING (...::"Enum")` casts only succeed if every existing value is a
-- valid enum label. Current data is 'USER'/'EDITOR' and 'ASTA'/'STUPA', so the
-- casts map cleanly. Postgres runs each migration file in a transaction, so if
-- a stray value exists the whole migration rolls back rather than half-applying.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'EDITOR');

-- CreateEnum
CREATE TYPE "Gremium" AS ENUM ('ASTA', 'STUPA');

-- AlterTable: User.role  text -> "Role"
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

-- AlterTable: Protocol.gremium  text -> "Gremium"
ALTER TABLE "Protocol" ALTER COLUMN "gremium" TYPE "Gremium" USING ("gremium"::"Gremium");

-- AlterTable: drop unused column
ALTER TABLE "Page" DROP COLUMN "intro";
