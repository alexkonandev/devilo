export const RELANCE_TEMPLATES = {
  SOFT: {
    id: "soft",
    label: "Courtois",
    subject: "Mise à jour stratégique // Dossier {{NUMBER}}",
    body: "Bonjour {{NAME}},\n\nJe fais suite à l'envoi de notre proposition {{NUMBER}} concernant votre projet. \n\nAu-delà des chiffres, j'aimerais m'assurer que l'approche méthodologique proposée est en parfaite adéquation avec vos objectifs actuels. \n\nAvez-vous identifié des points spécifiques nécessitant un ajustement technique ou une clarification de ma part ?\n\nDans l'attente de votre retour pour valider la prochaine étape.\n\nCordialement.",
  },
  DIRECT: {
    id: "direct",
    label: "Direct",
    subject: "Disponibilité opérationnelle : Devis {{NUMBER}}",
    body: "Bonjour {{NAME}},\n\nJe reviens vers vous concernant le devis {{NUMBER}} ({{AMOUNT}} XOF). \n\nÀ ce jour, mon planning de production pour les prochaines semaines se finalise. Afin de vous garantir le respect des délais de livraison évoqués lors de nos échanges, j'aurais besoin de votre validation d'ici 48h pour sécuriser votre créneau dans mon workflow.\n\nLe document est-il toujours en cours de circuit de signature ?\n\nBien à vous.",
  },
  URGENT: {
    id: "urgent",
    label: "Urgent",
    subject: "URGENT : Expiration des conditions commerciales {{NUMBER}}",
    body: "Bonjour {{NAME}},\n\nSauf erreur de ma part, je n'ai pas reçu le retour signé pour le devis {{NUMBER}}.\n\nJe vous informe que les conditions tarifaires ({{AMOUNT}} XOF) et les remises appliquées sur cette proposition arrivent à échéance sous 24 heures. Passé ce délai, je serai contraint de réémettre une proposition basée sur les tarifs en vigueur, sans garantie de conserver les mêmes disponibilités.\n\nSouhaitez-vous que nous validions cela immédiatement pour figer ces conditions ?\n\nMerci de votre retour rapide.",
  },
} as const;

export type TemplateType = keyof typeof RELANCE_TEMPLATES;
