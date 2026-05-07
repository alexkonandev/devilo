"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  WarningIcon,
  ActivityIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import {
  revokeSession,
  type SecurityProfile,
  type ParsedSession,
} from "@/actions/security-action";

// ─── Design System tokens (locaux) ───────────────────────────────────────────
const DS = {
  micro: "text-[9px] uppercase font-bold tracking-tighter",
  label: "text-[10px] uppercase font-bold tracking-wider text-slate-400",
  mono: "font-mono text-[11px] tabular-nums leading-none",
  card: "bg-white border border-slate-100/60",
  input:
    "bg-slate-100/50 border-0 border-b border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-0 transition-all",
  button:
    "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-all",
};

// ─── zxcvbn lazy loader ───────────────────────────────────────────────────────
let zxcvbnInitialized = false;
async function getZxcvbn() {
  const { zxcvbn, zxcvbnOptions } = await import("@zxcvbn-ts/core");
  if (!zxcvbnInitialized) {
    const { adjacencyGraphs, dictionary } =
      await import("@zxcvbn-ts/language-common");
    zxcvbnOptions.setOptions({ graphs: adjacencyGraphs, dictionary });
    zxcvbnInitialized = true;
  }
  return zxcvbn;
}

const PWD_LABELS = [
  "Très faible",
  "Faible",
  "Moyen",
  "Fort",
  "Très fort",
] as const;
const PWD_COLORS = [
  "bg-rose-500",
  "bg-orange-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-emerald-600",
] as const;
const PWD_TEXT_COLORS = [
  "text-rose-600",
  "text-orange-500",
  "text-amber-500",
  "text-emerald-600",
  "text-emerald-700",
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BentoSecurityCard
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoSecurityCardProps {
  showPassword: boolean;
  setShowPassword: (v: boolean | ((prev: boolean) => boolean)) => void;
  securityProfile: SecurityProfile;
  className?: string;
}

export function BentoSecurityCard({
  showPassword,
  setShowPassword,
  securityProfile,
  className,
}: BentoSecurityCardProps) {
  const sp = securityProfile;
  const [sessions, setSessions] = useState<ParsedSession[]>(sp.sessions);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [renderTime] = useState(() => Date.now());

  const [pwdValue, setPwdValue] = useState("");
  const [pwdScore, setPwdScore] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [pwdPending, setPwdPending] = useState(false);

  const handlePwdChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPwdValue(val);
      if (!val) {
        setPwdScore(0);
        return;
      }
      setPwdPending(true);
      const zxcvbn = await getZxcvbn();
      const result = zxcvbn(val);
      setPwdScore(result.score as 0 | 1 | 2 | 3 | 4);
      setPwdPending(false);
    },
    [],
  );

  const handleRevoke = useCallback(async (sessionId: string) => {
    setRevoking(sessionId);
    const res = await revokeSession(sessionId);
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session révoquée");
    } else {
      toast.error("Échec révocation", { description: res.error });
    }
    setRevoking(null);
  }, []);

  const pwdBarWidth = pwdValue ? `${(pwdScore + 1) * 20}%` : "0%";

  return (
    <div className={cn(DS.card, "rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-rose-50 flex items-center justify-center">
            <ShieldCheckIcon size={12} className="text-rose-500" />
          </div>
          <span className={cn(DS.micro, "text-slate-600")}>Sécurité</span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60">
          CRITIQUE
        </span>
      </div>

      <div className="space-y-6">
        {/* ── Email vérifié ── */}
        <div>
          <h4 className={cn(DS.label, "mb-3")}>Email Principal</h4>
          <div className="p-3 bg-slate-50 rounded border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {sp.sessions[0]?.ip
                    ? sp.sessions.find((s) => s.isCurrent)?.city
                      ? `${sp.sessions.find((s) => s.isCurrent)?.city}`
                      : "Authentifié"
                    : "Authentifié"}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  {sp.emailVerified ? (
                    <>
                      <CheckCircleIcon size={10} className="text-emerald-500" />
                      Email vérifié
                    </>
                  ) : (
                    <>
                      <XCircleIcon size={10} className="text-rose-500" />
                      Email non vérifié
                    </>
                  )}
                </p>
              </div>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[8px] font-bold",
                  sp.emailVerified
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                    : "bg-rose-50 text-rose-600 border border-rose-200/60",
                )}
              >
                {sp.emailVerified ? "VÉRIFIÉ" : "PENDING"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Force MDP temps réel ── */}
        <div>
          <h4 className={cn(DS.label, "mb-3")}>Nouveau mot de passe</h4>
          <div className="relative">
            <input
              value={pwdValue}
              onChange={handlePwdChange}
              type={showPassword ? "text" : "password"}
              className={cn(
                DS.input,
                "w-full px-3 py-2 text-sm rounded-t pr-10",
              )}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeSlashIcon size={12} />
              ) : (
                <EyeIcon size={12} />
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  pwdValue ? PWD_COLORS[pwdScore] : "bg-transparent",
                )}
                style={{ width: pwdBarWidth }}
              />
            </div>
            {pwdValue && !pwdPending && (
              <span
                className={cn(
                  DS.mono,
                  "text-[10px]",
                  PWD_TEXT_COLORS[pwdScore],
                )}
              >
                {PWD_LABELS[pwdScore]}
              </span>
            )}
          </div>
          {pwdValue && pwdScore >= 2 && (
            <p className="mt-1.5 text-[10px] text-slate-400">
              Appuyez sur Sauvegarder pour mettre à jour via Clerk.
            </p>
          )}
        </div>

        {/* ── Sessions actives réelles ── */}
        <div>
          <h4 className={cn(DS.label, "mb-3")}>
            Sessions Actives
            <span className="ml-2 px-1 py-0.5 rounded bg-slate-100 text-slate-500 text-[8px] font-bold">
              {sessions.length}
            </span>
          </h4>
          <div className="space-y-2">
            {sessions.length === 0 && (
              <p className={cn(DS.mono, "text-[10px] text-slate-400")}>
                Aucune session active
              </p>
            )}
            {sessions.map((s) => {
              const ago = new Date(s.lastActiveAt);
              const diffMin = Math.floor((renderTime - ago.getTime()) / 60000);
              const timeLabel =
                diffMin < 1
                  ? "Maintenant"
                  : diffMin < 60
                    ? `${diffMin}min`
                    : `${Math.floor(diffMin / 60)}h`;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded border",
                    s.isCurrent
                      ? "bg-emerald-50/60 border-emerald-100"
                      : "bg-slate-50 border-slate-100",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        s.isCurrent ? "bg-emerald-500" : "bg-slate-300",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {s.browser} · {s.os}
                        {s.isCurrent && (
                          <span className="ml-1.5 text-[8px] font-bold text-emerald-600 uppercase">
                            Cette session
                          </span>
                        )}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">
                        {s.ip !== "—" ? `IP: ${s.ip}` : "IP inconnue"}
                        {s.city !== "—" ? ` · ${s.city}, ${s.country}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={cn(DS.mono, "text-[9px] text-slate-400")}>
                      {timeLabel}
                    </span>
                    {!s.isCurrent && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(s.id)}
                        disabled={revoking === s.id}
                        className="text-[9px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wide disabled:opacity-40"
                      >
                        {revoking === s.id ? "…" : "Révoquer"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ScoreRow (déclaré hors composant pour éviter la recréation au render) ────
function ScoreRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? (
        <CheckCircleIcon size={10} className="text-emerald-500 shrink-0" />
      ) : (
        <XCircleIcon size={10} className="text-rose-400 shrink-0" />
      )}
      <span className={cn("text-xs", ok ? "text-slate-600" : "text-slate-400")}>
        {label}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BentoSecurityTelemetry
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoSecurityTelemetryProps {
  securityProfile: SecurityProfile;
  className?: string;
}

export function BentoSecurityTelemetry({
  securityProfile,
  className,
}: BentoSecurityTelemetryProps) {
  const sp = securityProfile;
  const currentSession = sp.sessions.find((s) => s.isCurrent) ?? sp.sessions[0];

  const scoreColor =
    sp.score >= 75
      ? "text-emerald-700"
      : sp.score >= 50
        ? "text-amber-600"
        : "text-rose-600";

  const scoreBg =
    sp.score >= 75
      ? "bg-emerald-50 border-emerald-100"
      : sp.score >= 50
        ? "bg-amber-50 border-amber-100"
        : "bg-rose-50 border-rose-100";

  const scoreBarColor =
    sp.score >= 75
      ? "bg-emerald-500"
      : sp.score >= 50
        ? "bg-amber-400"
        : "bg-rose-400";

  return (
    <div className={cn(DS.card, "rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className={cn(DS.micro, "text-slate-600")}>Force du Compte</span>
      </div>

      <div className="space-y-3">
        <div className={cn("p-3 rounded border", scoreBg)}>
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-sm font-bold", scoreColor)}>
              Score : {sp.score}/100
            </span>
            {sp.score >= 75 ? (
              <CheckCircleIcon size={16} className="text-emerald-500" />
            ) : (
              <WarningIcon size={16} className="text-amber-500" />
            )}
          </div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mb-3">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                scoreBarColor,
              )}
              style={{ width: `${sp.score}%` }}
            />
          </div>
          <div className="space-y-1">
            <ScoreRow ok={sp.emailVerified} label="Email vérifié (+50 pts)" />
            <ScoreRow ok={sp.score >= 75} label="Profil complet (+50 pts)" />
          </div>
        </div>

        {currentSession && (
          <>
            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <ActivityIcon size={12} className="text-slate-400" />
                <span className={cn(DS.label, "text-slate-500")}>
                  Session courante
                </span>
              </div>
              <span className={cn(DS.mono, "text-slate-700 truncate block")}>
                {currentSession.browser} · {currentSession.os}
              </span>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <GlobeIcon size={12} className="text-slate-400" />
                <span className={cn(DS.label, "text-slate-500")}>
                  Localisation
                </span>
              </div>
              <span className={cn(DS.mono, "text-slate-700")}>
                {currentSession.city !== "—" && currentSession.country !== "—"
                  ? `${currentSession.city}, ${currentSession.country}`
                  : currentSession.ip !== "—"
                    ? `IP : ${currentSession.ip}`
                    : "Non disponible"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
