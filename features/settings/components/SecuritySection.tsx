
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
  ClockIcon,
  LockKeyIcon,
} from "@phosphor-icons/react";
import {
  revokeSession,
  updatePassword,
  setInitialPassword,
  type SecurityProfile,
  type ParsedSession,
} from "@/actions/security-action";
import {
  STUDIO_V2_CARD,
  DS_LABEL,
  DS_MONO,
  DS_MICRO,
  DS_INPUT,
  DS_ICON_WRAPPER,
  DS_BADGE_SUCCESS,
  DS_BADGE_DANGER,
  DS_BADGE_NEUTRAL,
  DS_PROGRESS_TRACK,
  DS_PROGRESS_BAR,
  DS_ICON_SM,
  DS_ICON_XS,
  DS_ROUNDED,
} from "@/lib/design-system";

// ─── zxcvbn lazy loader ───────────────────────────────────────────────────────
let zxcvbnInitialized = false;
async function getZxcvbn() {
  const { zxcvbn, zxcvbnOptions } = await import("@zxcvbn-ts/core");
  if (!zxcvbnInitialized) {
    const { adjacencyGraphs, dictionary } = await import("@zxcvbn-ts/language-common");
    zxcvbnOptions.setOptions({ graphs: adjacencyGraphs, dictionary });
    zxcvbnInitialized = true;
  }
  return zxcvbn;
}

const PWD_LABELS = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"] as const;
const PWD_COLORS = ["bg-rose-500", "bg-orange-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-600"] as const;
const PWD_TEXT_COLORS = ["text-rose-600", "text-orange-500", "text-amber-500", "text-emerald-600", "text-emerald-700"] as const;

// ═══════════════════════════════════════════════════════════
// StatutEmail — ligne compacte avec statut vérifié/non vérifié
// ═══════════════════════════════════════════════════════════

function StatutEmail({ verified }: { verified: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5">
      <div className="flex items-center gap-2">
        <span className={DS_LABEL}>Email</span>
        <span className={cn(DS_MONO, "text-[10px] text-slate-900")}>Authentifié</span>
      </div>
      <span className={cn(verified ? DS_BADGE_SUCCESS : DS_BADGE_DANGER, "text-[7px] leading-none")}>
        {verified ? "VÉRIFIÉ" : "EN ATTENTE"}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PasswordStrength — input avec oeil + barre de progression (interne)
// ═══════════════════════════════════════════════════════════

function PasswordStrength({
  value,
  onChange,
  show,
  onToggleShow,
  label,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggleShow: () => void;
  label: string;
  placeholder?: string;
  autoComplete: string;
}) {
  const [pwdScore, setPwdScore] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [pwdPending, setPwdPending] = useState(false);

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (!val) { setPwdScore(0); return; }
    setPwdPending(true);
    const zxcvbn = await getZxcvbn();
    const result = zxcvbn(val);
    setPwdScore(result.score as 0 | 1 | 2 | 3 | 4);
    setPwdPending(false);
  }, [onChange]);

  const barWidth = value ? `${(pwdScore + 1) * 20}%` : "0%";

  return (
    <div>
      <span className={cn(DS_LABEL, "mb-1 block")}>{label}</span>
      <div className="relative">
        <input value={value} onChange={handleChange}
          type={show ? "text" : "password"}
          className={cn(DS_INPUT, DS_ROUNDED, "w-full text-xs pr-8")}
          placeholder={placeholder ?? "••••••••"}
          autoComplete={autoComplete} />
        <button type="button" onClick={onToggleShow}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center w-4 h-4">
          {show ? <EyeSlashIcon size={9} /> : <EyeIcon size={9} />}
        </button>
      </div>
      {value && (
        <>
          <div className="mt-1 flex items-center gap-2">
            <div className={cn(DS_PROGRESS_TRACK, "flex-1")}>
              <div className={cn(DS_PROGRESS_BAR, PWD_COLORS[pwdScore])}
                style={{ width: barWidth }} />
            </div>
            {!pwdPending && (
              <span className={cn(DS_MONO, "text-[8px]", PWD_TEXT_COLORS[pwdScore])}>{PWD_LABELS[pwdScore]}</span>
            )}
          </div>
          {pwdScore < 3 && (
            <p className="text-[7px] text-amber-600 mt-0.5">Utilisez au moins 8 caractères avec lettres, chiffres et symboles</p>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PasswordField — champ simple avec toggle (pour current / confirm)
// ═══════════════════════════════════════════════════════════

function PasswordField({
  value,
  onChange,
  show,
  onToggleShow,
  label,
  placeholder,
  autoComplete,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggleShow: () => void;
  label: string;
  placeholder?: string;
  autoComplete: string;
  error?: string;
}) {
  return (
    <div>
      <span className={cn(DS_LABEL, "mb-1 block")}>{label}</span>
      <div className="relative">
        <input value={value} onChange={(e) => onChange(e.target.value)}
          type={show ? "text" : "password"}
          className={cn(DS_INPUT, DS_ROUNDED, "w-full text-xs pr-8", error && "border-rose-300 bg-rose-50/40")}
          placeholder={placeholder ?? "••••••••"}
          autoComplete={autoComplete} />
        <button type="button" onClick={onToggleShow}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center w-4 h-4">
          {show ? <EyeSlashIcon size={9} /> : <EyeIcon size={9} />}
        </button>
      </div>
      {error && <p className="text-[7px] text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ChangePasswordForm — formulaire complet changement de mot de passe
// ═══════════════════════════════════════════════════════════

function ChangePasswordForm({ passwordEnabled }: { passwordEnabled: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isPending, setIsPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const passwordsMatch = confirmPassword === "" || confirmPassword === newPassword;
  const newPasswordValid = newPassword === "" || newPassword.length >= 8;
  const canSubmit = newPassword.length >= 8 && passwordsMatch && confirmPassword.length >= 1
    && (passwordEnabled ? currentPassword.length >= 1 : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Validation finale
    const errors: { current?: string; new?: string; confirm?: string } = {};
    if (passwordEnabled && !currentPassword) errors.current = "Mot de passe actuel requis";
    if (newPassword.length < 8) errors.new = "Minimum 8 caractères";
    if (confirmPassword !== newPassword) errors.confirm = "Les mots de passe ne correspondent pas";
    if (passwordEnabled && currentPassword === newPassword) errors.new = "Le nouveau mot de passe doit être différent de l'actuel";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsPending(true);

    // Utiliser setInitialPassword pour les utilisateurs OAuth, updatePassword sinon
    const res = passwordEnabled
      ? await updatePassword(currentPassword, newPassword)
      : await setInitialPassword(newPassword);
    setIsPending(false);

    if (res.success) {
      toast.success(passwordEnabled ? "Mot de passe mis à jour" : "Mot de passe créé", {
        description: passwordEnabled
          ? "Votre mot de passe a été changé avec succès"
          : "Vous avez maintenant un mot de passe pour vous connecter",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      // Mapper les erreurs serveur sur les champs
      if (res.error === "WRONG_CURRENT_PASSWORD") {
        setFieldErrors({ current: res.message });
      } else if (res.error === "SAME_AS_OLD") {
        setFieldErrors({ new: res.message });
      } else {
        toast.error("Erreur", { description: res.message ?? "Impossible de changer le mot de passe" });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <LockKeyIcon size={9} className="text-slate-500" />
        <span className={cn(DS_LABEL, "text-slate-700")}>
          {passwordEnabled ? "Changer le mot de passe" : "Créer un mot de passe"}
        </span>
      </div>

      {!passwordEnabled && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-2 py-1.5">
          <p className="text-[7.5px] text-amber-700 leading-tight">
            Vous utilisez actuellement une connexion via Google. Créez un mot de passe pour pouvoir vous connecter avec votre email.
          </p>
        </div>
      )}

      {passwordEnabled && (
        <PasswordField
          value={currentPassword}
          onChange={(v) => { setCurrentPassword(v); if (fieldErrors.current) setFieldErrors((p) => ({ ...p, current: undefined })); }}
          show={showCurrent}
          onToggleShow={() => setShowCurrent((v) => !v)}
          label="Mot de passe actuel"
          autoComplete="current-password"
          error={fieldErrors.current}
        />
      )}

      <PasswordStrength
        value={newPassword}
        onChange={(v) => { setNewPassword(v); if (fieldErrors.new) setFieldErrors((p) => ({ ...p, new: undefined })); }}
        show={showNew}
        onToggleShow={() => setShowNew((v) => !v)}
        label="Nouveau mot de passe"
        autoComplete="new-password"
      />
      {fieldErrors.new && (
        <p className="text-[7px] text-rose-500 -mt-2">{fieldErrors.new}</p>
      )}

      <PasswordField
        value={confirmPassword}
        onChange={(v) => { setConfirmPassword(v); if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
        show={showConfirm}
        onToggleShow={() => setShowConfirm((v) => !v)}
        label="Confirmer le mot de passe"
        autoComplete="new-password"
        error={fieldErrors.confirm}
      />

      {/* Indicateur match */}
      {confirmPassword && !passwordsMatch && (
        <p className="text-[7px] text-rose-500 -mt-2">Les mots de passe ne correspondent pas</p>
      )}

      <button type="button" onClick={handleSubmit} disabled={!canSubmit || isPending}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-all",
          canSubmit && !isPending
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-slate-100 text-slate-300 cursor-not-allowed",
        )}>
        {isPending ? (
          <>
            <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Mise à jour…
          </>
        ) : (
          "Mettre à jour le mot de passe"
        )}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SessionItem — une ligne de session
// ═══════════════════════════════════════════════════════════

function SessionItem({
  session,
  isCurrent,
  revoking,
  renderTime,
  onRevoke,
}: {
  session: ParsedSession;
  isCurrent: boolean;
  revoking: string | null;
  renderTime: number;
  onRevoke: (id: string) => void;
}) {
  const ago = new Date(session.lastActiveAt);
  const diffMin = Math.floor((renderTime - ago.getTime()) / 60000);
  const timeLabel = diffMin < 1 ? "Maintenant" : diffMin < 60 ? `${diffMin}min` : `${Math.floor(diffMin / 60)}h`;

  return (
    <div className={cn(
      "flex items-center px-2 py-1.5 rounded-md border",
      isCurrent ? "bg-emerald-50/60 border-emerald-100" : "bg-slate-50 border-slate-100",
    )}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-px self-center", isCurrent ? "bg-emerald-500" : "bg-slate-400")} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-slate-900 truncate leading-tight">
            {session.browser} · {session.os}
          </p>
          <p className="text-[7px] text-slate-600 truncate leading-tight">
            {session.city !== "—" ? `${session.city}` : session.ip !== "—" ? `IP: ${session.ip}` : "Localisation inconnue"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="flex items-center gap-0.5 text-[7px] text-slate-500 whitespace-nowrap">
          <ClockIcon size={7} />{timeLabel}
        </span>
        {isCurrent ? (
          <span className="text-[7px] font-bold text-emerald-600 uppercase tracking-wide whitespace-nowrap">Active</span>
        ) : (
          <button type="button" onClick={() => onRevoke(session.id)} disabled={revoking === session.id}
            className="text-[7px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wide disabled:opacity-40 whitespace-nowrap">
            {revoking === session.id ? "…" : "Révoquer"}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BentoSecurityCard
// ═══════════════════════════════════════════════════════════

interface BentoSecurityCardProps {
  securityProfile: SecurityProfile;
  className?: string;
}

export function BentoSecurityCard({
  securityProfile,
  className,
}: BentoSecurityCardProps) {
  const sp = securityProfile;
  const [sessions, setSessions] = useState<ParsedSession[]>(sp.sessions);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [renderTime] = useState(() => Date.now());

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

  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 shrink-0 rounded-md bg-indigo-50">
            <ShieldCheckIcon size={10} className="text-indigo-500" />
          </div>
          <span className={cn("text-[9px] font-mono uppercase tracking-wide text-slate-700")}>Sécurité</span>
        </div>
        <span className={DS_BADGE_NEUTRAL}>{sessions.length} session{sessions.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-3">
        {/* Email */}
        <StatutEmail verified={sp.emailVerified ?? false} />

        {/* Mot de passe — formulaire complet */}
        <div className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-2">
          <ChangePasswordForm passwordEnabled={sp.passwordEnabled} />
        </div>

        {/* Sessions */}
        <div>
          <span className={cn(DS_LABEL, "mb-1.5 block")}>Sessions actives</span>
          {sessions.length === 0 && (
            <p className={cn(DS_MONO, "text-[9px] text-slate-600")}>Aucune session active</p>
          )}
          <div className="space-y-1">
            {sessions.map((s) => (
              <SessionItem
                key={s.id}
                session={s}
                isCurrent={s.isCurrent}
                revoking={revoking}
                renderTime={renderTime}
                onRevoke={handleRevoke}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}