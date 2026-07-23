-- Migration pour supprimer les champs bancaires et le statut CANCELLED

-- Supprimer les colonnes bancaires de la table users
ALTER TABLE "users" DROP COLUMN IF EXISTS "paymentZone",
                    DROP COLUMN IF EXISTS "bankName",
                    DROP COLUMN IF EXISTS "bankIBAN",
                    DROP COLUMN IF EXISTS "bankSWIFT",
                    DROP COLUMN IF EXISTS "bankBIC",
                    DROP COLUMN IF EXISTS "bankRoutingNumber",
                    DROP COLUMN IF EXISTS "bankAccountNumber",
                    DROP COLUMN IF EXISTS "showBankDetailsOnQuotes";

-- Supprimer les colonnes bancaires de la table quotes
ALTER TABLE "quotes" DROP COLUMN IF EXISTS "paymentZone",
                    DROP COLUMN IF EXISTS "bankName",
                    DROP COLUMN IF EXISTS "bankIBAN",
                    DROP COLUMN IF EXISTS "bankSWIFT",
                    DROP COLUMN IF EXISTS "bankBIC",
                    DROP COLUMN IF EXISTS "bankRoutingNumber",
                    DROP COLUMN IF EXISTS "bankAccountNumber",
                    DROP COLUMN IF EXISTS "showBankDetails";

-- Mettre à jour la contrainte CHECK sur quotes pour le statut CANCELLED
-- D'abord vérifier si la colonne status a une contrainte check qui inclut CANCELLED
DO $$
BEGIN
  -- Supprimer les lignes avec le statut CANCELLED
  DELETE FROM "quote_events" WHERE status = 'CANCELLED';
  UPDATE "quotes" SET status = 'REJECTED' WHERE status = 'CANCELLED';
END;
$$;