// lib/constants.ts

// REMARQUE : Les fonctions Lucide-React (Code2, PenTool, etc.) sont supprimées de l'importation
// car elles ne doivent pas apparaître dans ce fichier Server-Side.

export const DOMAIN_MAP: {
  [key: string]: { label: string; iconName: string; color: string };
} = {
  Tech: {
    label: "Tech & Dev",
    iconName: "Code2", // <-- String sérialisable
    color: "text-blue-600 bg-blue-50 border-blue-100",
  },
  Design: {
    label: "Design & Créa",
    iconName: "PenTool", // <-- String sérialisable
    color: "text-purple-600 bg-purple-50 border-purple-100",
  },
  Marketing: {
    label: "Marketing Digital",
    iconName: "Megaphone",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  Consulting: {
    label: "Consulting & Stratégie",
    iconName: "Briefcase",
    color: "text-yellow-600 bg-yellow-50 border-yellow-100",
  },
  AV: {
    label: "Audio & Vidéo",
    iconName: "Video",
    color: "text-red-600 bg-red-50 border-red-100",
  },
  Admin: {
    label: "Admin & Support",
    iconName: "UserCog",
    color: "text-orange-600 bg-orange-50 border-orange-100",
  },
  Légal: {
    label: "Légal & Compliance",
    iconName: "Shield",
    color: "text-pink-600 bg-pink-50 border-pink-100",
  },
};

/**
 * Nombre maximum de lignes (prestations) autorisées par devis.
 * Cette limite est appliquée à la fois côté UI (store) et côté serveur (action).
 */
export const MAX_QUOTE_LINES = 15;