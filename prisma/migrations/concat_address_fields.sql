-- Migration: Concaténer companyArea et companyDistrict dans companyAddressDetails
-- Avant de supprimer les champs, on préserve les données existantes

UPDATE "User" 
SET "companyAddressDetails" = 
  CASE 
    WHEN "companyAddressDetails" IS NULL OR "companyAddressDetails" = '' THEN
      TRIM(COALESCE("companyArea", '') || ', ' || COALESCE("companyDistrict", ''), ', ')
    WHEN "companyArea" IS NOT NULL AND "companyDistrict" IS NOT NULL THEN
      "companyAddressDetails" || ', ' || "companyArea" || ', ' || "companyDistrict"
    WHEN "companyArea" IS NOT NULL THEN
      "companyAddressDetails" || ', ' || "companyArea"
    WHEN "companyDistrict" IS NOT NULL THEN
      "companyAddressDetails" || ', ' || "companyDistrict"
    ELSE
      "companyAddressDetails"
  END
WHERE "companyArea" IS NOT NULL OR "companyDistrict" IS NOT NULL;

-- Nettoyer les valeurs vides ou contenant seulement des virgules
UPDATE "User" 
SET "companyAddressDetails" = NULL 
WHERE "companyAddressDetails" = '' OR "companyAddressDetails" = ', ' OR "companyAddressDetails" LIKE ',%';

-- Journal des modifications pour vérification
SELECT 
  id, 
  email,
  "companyAddressDetails" as new_address,
  "companyArea" as old_area,
  "companyDistrict" as old_district
FROM "User" 
WHERE "companyArea" IS NOT NULL OR "companyDistrict" IS NOT NULL;
