/**
 * SOURCE_TYPE : Identification du flux d'origine
 */
export type CatalogSource = "PERSONAL" | "PLATFORM";

/**
 * CATALOG_SERVICE : Le pivot de données unifié
 * Fusionne CatalogOffer (Plateforme) et UserService (Perso).
 * Les noms sont strictement identiques à l'interface React et au schéma Prisma.
 */
export interface CatalogService {
  id: string;
  title: string;
  subtitle: string;
  unitPrice: number;
  /**
   * baseCost : Le coût de revient interne (Temps/Ressources).
   * Vital pour le calcul de la marge de performance.
   */
  baseCost: number;
  category: string;
  source: CatalogSource;
  isPremium: boolean;
  userId: string;
  createdAt: Date;
}

/**
 * FILTRAGE_STRATÉGIQUE
 */
export interface CatalogFilters {
  search: string;
  category: string | "ALL";
}

/**
 * ACTION_RESPONSE : Contrat de mutation standard
 */
export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * DND_PAYLOAD : Payload de transfert pour @dnd-kit
 */
export interface DragData {
  type: "CATALOG_ITEM";
  source: CatalogSource;
  service: CatalogService;
}
