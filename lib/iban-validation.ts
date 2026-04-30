// Utilitaires de validation et formatage IBAN

/**
 * Valide un IBAN en utilisant l'algorithme Modulo 97
 * @param iban L'IBAN à valider
 * @returns true si l'IBAN est valide, false sinon
 */
export function validateIBAN(iban: string): boolean {
  // Nettoyer l'IBAN : supprimer les espaces et mettre en majuscules
  const cleanIBAN = iban.replace(/\s/g, "").toUpperCase();

  // Vérifier le format de base (2 lettres + 2 chiffres + alphanumérique)
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN)) {
    return false;
  }

  // Algorithme Modulo 97
  // 1. Déplacer les 4 premiers caractères à la fin
  const rearranged = cleanIBAN.substring(4) + cleanIBAN.substring(0, 4);

  // 2. Remplacer les lettres par des chiffres (A=10, B=11, ..., Z=35)
  let numeric = "";
  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged[i];
    if (/[A-Z]/.test(char)) {
      numeric += (char.charCodeAt(0) - 55).toString();
    } else {
      numeric += char;
    }
  }

  // 3. Calculer le modulo 97
  // Pour les grands nombres, on traite par blocs
  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + parseInt(numeric[i])) % 97;
  }

  return remainder === 1;
}

/**
 * Formate un IBAN par blocs de 4 caractères
 * @param iban L'IBAN à formater
 * @returns L'IBAN formaté avec des espaces
 */
export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Extrait le code banque d'un IBAN français
 * @param iban L'IBAN français
 * @returns Le code banque (5 chiffres) ou null
 */
export function extractBankCode(iban: string): string | null {
  const clean = iban.replace(/\s/g, "").toUpperCase();

  // Pour la France, le code banque est aux positions 5-9 (0-indexed)
  if (clean.startsWith("FR") && clean.length >= 14) {
    return clean.substring(4, 9);
  }

  return null;
}

/**
 * Détecte le pays d'un IBAN
 * @param iban L'IBAN à analyser
 * @returns Le code pays (2 lettres) ou null
 */
export function extractCountryCode(iban: string): string | null {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  return clean.length >= 2 ? clean.substring(0, 2) : null;
}

/**
 * Masque partiellement un IBAN pour l'affichage
 * @param iban L'IBAN à masquer
 * @returns L'IBAN masqué (ex: FR76 •••• •••• 606)
 */
export function maskIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  if (clean.length < 8) return iban;

  const start = clean.substring(0, 4);
  const end = clean.substring(clean.length - 3);
  const middleCount = clean.length - 7;
  const middle = "•".repeat(middleCount);

  const masked = start + middle + end;
  return formatIBAN(masked);
}

/**
 * Dictionnaire des codes BIC des principales banques françaises
 */
export const FRENCH_BANK_BIC: Record<string, string> = {
  "30004": "BNPAFRPP",
  "30002": "BNPAFRPPXXX",
  "18706": "HSBCFRPP",
  "18900": "CMCIFRPP",
  "13807": "BPFKFRPP",
  "10207": "BICMFRPP",
  "10448": "BDFEFRPP",
  "10807": "BKBKFRPP",
  "10907": "BNPAFRPP",
  "11406": "BORDFRMM",
  "12406": "BPCEFRPP",
  "12548": "BPLAFRPP",
  "13206": "BREGFRPP",
  "13507": "BNPAFRPP",
  "14707": "BNPAFRPP",
  "16807": "BCHQFRPP",
  "17430": "CCBPFRPP",
  "17515": "CDGCFRPP",
  "18089": "CFFRFRPP",
  "18469": "CHASFRPP",
  "18589": "CITIFRPP",
  "30076": "BNPAFRPP",
  "30178": "BNPAFRPP",
  "30398": "BNPAFRPP",
  "30488": "BNPAFRPP",
  "30768": "BNPAFRPP",
  "30888": "BNPAFRPP",
  "31068": "BNPAFRPP",
  "31178": "BNPAFRPP",
  "31288": "BNPAFRPP",
  "31398": "BNPAFRPP",
  "31508": "BNPAFRPP",
  "31618": "BNPAFRPP",
  "31728": "BNPAFRPP",
  "31838": "BNPAFRPP",
  "31948": "BNPAFRPP",
  "32058": "BNPAFRPP",
  "32168": "BNPAFRPP",
  "32278": "BNPAFRPP",
  "32388": "BNPAFRPP",
  "32498": "BNPAFRPP",
  "32608": "BNPAFRPP",
  "32718": "BNPAFRPP",
  "32828": "BNPAFRPP",
  "32938": "BNPAFRPP",
  "33048": "BNPAFRPP",
  "33158": "BNPAFRPP",
  "33268": "BNPAFRPP",
  "33378": "BNPAFRPP",
  "33488": "BNPAFRPP",
  "33598": "BNPAFRPP",
  "33708": "BNPAFRPP",
  "33818": "BNPAFRPP",
  "33928": "BNPAFRPP",
  "34038": "BNPAFRPP",
  "34148": "BNPAFRPP",
  "34258": "BNPAFRPP",
  "34368": "BNPAFRPP",
  "34478": "BNPAFRPP",
  "34588": "BNPAFRPP",
  "34698": "BNPAFRPP",
  "34808": "BNPAFRPP",
  "34918": "BNPAFRPP",
  "35028": "BNPAFRPP",
  "35138": "BNPAFRPP",
  "35248": "BNPAFRPP",
  "35358": "BNPAFRPP",
  "35468": "BNPAFRPP",
  "35578": "BNPAFRPP",
  "35688": "BNPAFRPP",
  "35798": "BNPAFRPP",
  "35908": "BNPAFRPP",
  "36018": "BNPAFRPP",
  "36128": "BNPAFRPP",
  "36238": "BNPAFRPP",
  "36348": "BNPAFRPP",
  "36458": "BNPAFRPP",
  "36568": "BNPAFRPP",
  "36678": "BNPAFRPP",
  "36788": "BNPAFRPP",
  "36898": "BNPAFRPP",
  "37008": "BNPAFRPP",
  "37118": "BNPAFRPP",
  "37228": "BNPAFRPP",
  "37338": "BNPAFRPP",
  "37448": "BNPAFRPP",
  "37558": "BNPAFRPP",
  "37668": "BNPAFRPP",
  "37778": "BNPAFRPP",
  "37888": "BNPAFRPP",
  "37998": "BNPAFRPP",
  "38108": "BNPAFRPP",
  "38218": "BNPAFRPP",
  "38328": "BNPAFRPP",
  "38438": "BNPAFRPP",
  "38548": "BNPAFRPP",
  "38658": "BNPAFRPP",
  "38768": "BNPAFRPP",
  "38878": "BNPAFRPP",
  "38988": "BNPAFRPP",
  "39098": "BNPAFRPP",
  "39208": "BNPAFRPP",
  "39318": "BNPAFRPP",
  "39428": "BNPAFRPP",
  "39538": "BNPAFRPP",
  "39648": "BNPAFRPP",
  "39758": "BNPAFRPP",
  "39868": "BNPAFRPP",
  "39978": "BNPAFRPP",
};

/**
 * Suggère un code BIC basé sur le code banque extrait de l'IBAN
 * @param iban L'IBAN français
 * @returns Le code BIC suggéré ou null
 */
export function suggestBICFromIBAN(iban: string): string | null {
  const bankCode = extractBankCode(iban);
  if (!bankCode) return null;

  return FRENCH_BANK_BIC[bankCode] || null;
}

/**
 * Valide un code BIC/SWIFT selon la norme ISO 9362
 * @param bic Le code BIC à valider
 * @returns true si le BIC est valide, false sinon
 */
export function validateBIC(bic: string): boolean {
  const clean = bic.replace(/\s/g, "").toUpperCase();

  // Format: 6 lettres (banque+pays) + 2 lettres/chiffres (localisation) + 3 lettres/chiffres optionnels (branche)
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(clean);
}
