-- Migration manuelle pour aligner Prisma avec la DB Neon
ALTER TABLE "quotes" RENAME COLUMN "discountEuros" TO "discount";