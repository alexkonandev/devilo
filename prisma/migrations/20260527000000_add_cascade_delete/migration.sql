-- Migration: Ajouter ON DELETE CASCADE sur les clés étrangères liées aux clients
-- Pour permettre la suppression en cascade via Prisma deleteMany

-- Supprimer et recréer la contrainte quotes_clientId_fkey avec CASCADE
ALTER TABLE "quotes" DROP CONSTRAINT IF EXISTS "quotes_clientId_fkey",
  ADD CONSTRAINT "quotes_clientId_fkey" 
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE;

-- Supprimer et recréer la contrainte client_activities_clientId_fkey avec CASCADE
ALTER TABLE "ClientActivity" DROP CONSTRAINT IF EXISTS "ClientActivity_clientId_fkey",
  ADD CONSTRAINT "ClientActivity_clientId_fkey" 
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE;