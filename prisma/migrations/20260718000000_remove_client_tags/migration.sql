-- AlterTable: Remove tags column from clients
ALTER TABLE "clients" DROP COLUMN IF EXISTS "tags";
