// ═══════════════════════════════════════════════════════════════════════════════
// STUDIO LOADER — Écran de chargement minimal (SVG animé inline)
// Zéro dépendance, zéro JS : un spinner SVG + CSS pur.
// Utilisé par :
//   1. quotes/new/loading.tsx (fallback serveur Next.js)
//   2. CreateQuoteClient.tsx (fallback hydratation client)
// ═══════════════════════════════════════════════════════════════════════════════

export default function StudioLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-slate-50">
      {/* ─── Spinner SVG ─── */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
        style={{ animationDuration: "0.8s" }}
      >
        {/* Anneau de fond (gris clair) */}
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="#e2e8f0"
          strokeWidth="3"
          fill="none"
        />
        {/* Arc animé (indigo, 75% de la circonférence) */}
        <circle
          cx="20"
          cy="20"
          r="16"
          stroke="url(#spinner-grad)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="75 25"
        />

        {/* Dégradé indigo → violet */}
        <defs>
          <linearGradient id="spinner-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>

      {/* ─── Label subtil ─── */}
      <p className="text-[10px] font-sans uppercase tracking-[0.25em] text-slate-400 select-none">
        Chargement
      </p>
    </div>
  );
}