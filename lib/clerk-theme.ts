// Fichier: lib/clerk-theme.ts

export const clerkAppearance = {
  layout: {
    socialButtonsPlacement: "bottom" as const,
    logoPlacement: "none" as const, // On gère le logo manuellement dans le layout
  },
  elements: {
    // La carte principale (on retire les ombres par défaut pour fondre dans le layout)
    card: "shadow-none border-none bg-transparent w-full p-0",
    rootBox: "w-full",

    // Typographie des titres par défaut de Clerk (on les cache souvent pour mettre les nôtres)
    headerTitle: "sr-only",
    headerSubtitle: "sr-only",

    // Champs de formulaire (Style Obsidian Dark)
    formFieldInput:
      "h-10 rounded-lg border-[var(--lp-border)] bg-[var(--lp-card)] text-sm focus:ring-1 focus:ring-[var(--lp-accent)] focus:border-[var(--lp-accent)] transition-all placeholder:text-zinc-500 text-[var(--lp-text)]",
    formFieldLabel:
      "text-[11px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5",

    // Bouton Principal (Indigo Accent)
    formButtonPrimary:
      "h-10 rounded-lg bg-[var(--lp-accent)] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wide transition-all shadow-[0_0_20px_var(--lp-accent-glow)] active:scale-95",

    // Boutons Sociaux (Google, etc.)
    socialButtonsBlockButton:
      "h-10 rounded-lg border border-zinc-800 bg-transparent hover:border-zinc-600 text-zinc-300 hover:text-white text-xs font-bold transition-all",
    socialButtonsBlockButtonText: "font-bold text-zinc-300",

    // Liens et Footer
    footerActionLink:
      "text-[var(--lp-accent)] hover:underline font-bold text-xs underline-offset-4",
    identityPreviewText: "text-zinc-400 font-medium text-sm",
    formFieldAction:
      "text-[var(--lp-accent)] hover:opacity-90 font-bold text-[10px] uppercase cursor-pointer",

    // Séparateurs
    dividerLine: "bg-[var(--lp-border)]",
    dividerText:
      "text-zinc-500 text-[10px] font-bold uppercase tracking-widest bg-[var(--lp-card)] px-2",

    // Messages d'erreur
    formFieldWarningText: "text-xs text-amber-400 font-medium mt-1",
    formFieldErrorText: "text-xs text-red-400 font-medium mt-1",
  },
  variables: {
    colorPrimary: "#4f46e5", // indigo-600 (lp-accent)
    colorText: "#fafafa", // lp-text
    colorTextSecondary: "#a1a1aa", // zinc-400
    borderRadius: "0.5rem", // rounded-lg
    fontFamily: "inherit",
  },
};
