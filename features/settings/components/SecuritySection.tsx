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
import { DangerZoneCard } from "@/features/settings/components/DangerZoneSection";

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

function StatutEmail({ verified, email, passwordEnabled }: { verified: boolean; email: string; passwordEnabled: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5">
      <span className={cn(DS_LABEL, "shrink-0")}>Email</span>
      <span className="text-[9px] font-mono text-slate-500 truncate">{email}</span>
      <span className="text-[7px] text-slate-300">·</span>
      <span className="flex items-center gap-1 text-[9px] font-sans text-slate-600">
        {passwordEnabled ? "Mot de passe" : "Google"}
      </span>
      <span className="text-[7px] text-slate-300">·</span>
      <span className={cn(
        "text-[9px] font-sans font-semibold",
        verified ? "text-emerald-600" : "text-amber-600"
      )}>
        {verified ? "Vérifié" : "En attente"}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PasswordIndicator — barre de progression seule (sans input)
// ═══════════════════════════════════════════════════════════

function PasswordIndicator({ value }: { value: string }) {
  const [pwdScore, setPwdScore] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [pwdPending, setPwdPending] = useState(false);

  React.useEffect(() => {
    if (!value) { setPwdScore(0); return; }
    setPwdPending(true);
    getZxcvbn().then((zxcvbn) => {
      const result = zxcvbn(value);
      setPwdScore(result.score as 0 | 1 | 2 | 3 | 4);
      setPwdPending(false);
    });
  }, [value]);

  const barWidth = value ? `${(pwdScore + 1) * 20}%` : "0%";

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <div className={cn(DS_PROGRESS_TRACK, "flex-1")}>
          <div className={cn(DS_PROGRESS_BAR, PWD_COLORS[pwdScore])}
            style={{ width: barWidth }} />
        </div>
        {!pwdPending && (
          <span className="text-[8px] font-sans font-semibold lowercase text-slate-600">{PWD_LABELS[pwdScore]}</span>
        )}
      </div>
      {pwdScore < 3 && (
        <p className="text-[7px] text-amber-600">Utilisez au moins 8 caractères avec lettres, chiffres et symboles</p>
      )}
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
              <span className="text-[8px] font-sans font-semibold lowercase text-slate-600">{PWD_LABELS[pwdScore]}</span>
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

      <div className="grid grid-cols-12 gap-3 items-end">
        {passwordEnabled && (
          <div className="col-span-4">
            <PasswordField
              value={currentPassword}
              onChange={(v) => { setCurrentPassword(v); if (fieldErrors.current) setFieldErrors((p) => ({ ...p, current: undefined })); }}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              label="Mot de passe actuel"
              autoComplete="current-password"
              error={fieldErrors.current}
            />
          </div>
        )}

        {/* Nouveau mot de passe — input seul sans barre */}
        <div className={passwordEnabled ? "col-span-3" : "col-span-5"}>
          <span className={cn(DS_LABEL, "mb-1 block")}>Nouveau mot de passe</span>
          <div className="relative">
            <input value={newPassword}
              onChange={(e) => { const val = e.target.value; setNewPassword(val); if (fieldErrors.new) setFieldErrors((p) => ({ ...p, new: undefined })); }}
              type={showNew ? "text" : "password"}
              className={cn(DS_INPUT, DS_ROUNDED, "w-full text-xs pr-8")}
              placeholder="••••••••"
              autoComplete="new-password" />
            <button type="button" onClick={() => setShowNew((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center w-4 h-4">
              {showNew ? <EyeSlashIcon size={9} /> : <EyeIcon size={9} />}
            </button>
          </div>
        </div>

        {/* Confirmer le mot de passe */}
        <div className={passwordEnabled ? "col-span-3" : "col-span-5"}>
          <PasswordField
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((v) => !v)}
            label="Confirmer le mot de passe"
            autoComplete="new-password"
            error={fieldErrors.confirm}
          />
        </div>

        <button type="button" onClick={handleSubmit} disabled={!canSubmit || isPending}
          className={cn(
            "col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[9px] font-semibold uppercase tracking-wider transition-all",
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
            "Mettre à jour"
          )}
        </button>
      </div>

      {/* Barre de force + messages sous la grille */}
      <div className="mt-2 space-y-1">
        {newPassword && <PasswordIndicator value={newPassword} />}
        {fieldErrors.new && (
          <p className="text-[7px] text-rose-500">{fieldErrors.new}</p>
        )}
        {confirmPassword && !passwordsMatch && (
          <p className="text-[7px] text-rose-500">Les mots de passe ne correspondent pas</p>
        )}
      </div>

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
      "flex items-center px-2 py-1.5 rounded-md border flex-1",
      isCurrent ? "bg-emerald-50/60 border-emerald-100" : "bg-slate-50 border-slate-100",
    )}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 mt-px self-center", isCurrent ? "bg-emerald-500" : "bg-slate-400")} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-900 truncate leading-tight">
            {session.browser} · {session.os}
          </p>
          <p className="text-[9px] text-slate-600 truncate leading-tight">
            {session.city !== "—" ? `${session.city}` : session.ip !== "—" ? `IP: ${session.ip}` : "Localisation inconnue"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="flex items-center gap-0.5 text-[9px] text-slate-500 whitespace-nowrap">
          <ClockIcon size={8} />{timeLabel}
        </span>
        {isCurrent ? (
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide whitespace-nowrap">Active</span>
        ) : (
          <button type="button" onClick={() => onRevoke(session.id)} disabled={revoking === session.id}
            className="text-[9px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-wide disabled:opacity-40 whitespace-nowrap">
            {revoking === session.id ? "…" : "Révoquer"}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PasswordSecurityCard — Bloc gauche : mot de passe uniquement
// ═══════════════════════════════════════════════════════════

interface PasswordSecurityCardProps {
  securityProfile: SecurityProfile;
  userEmail: string;
  className?: string;
}

export function PasswordSecurityCard({
  securityProfile,
  userEmail,
  className,
}: PasswordSecurityCardProps) {
  return (
    <div className={cn(STUDIO_V2_CARD, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-5 h-5 shrink-0 rounded-md bg-indigo-50">
            <LockKeyIcon size={10} className="text-indigo-500" />
          </div>
          <span className="text-[9px] font-sans font-semibold uppercase tracking-wide text-slate-700">Mot de passe</span>
        </div>
        <span className={cn(securityProfile.emailVerified ? DS_BADGE_SUCCESS : DS_BADGE_DANGER, "text-[7px] leading-none")}>
          {securityProfile.emailVerified ? "VÉRIFIÉ" : "EN ATTENTE"}
        </span>
      </div>

      <div className="space-y-3">
        <StatutEmail verified={securityProfile.emailVerified} email={userEmail} passwordEnabled={securityProfile.passwordEnabled} />

        <div className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-2">
          <ChangePasswordForm passwordEnabled={securityProfile.passwordEnabled} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SessionDangerCard — Bloc droit : sessions actives + zone de danger
// ═══════════════════════════════════════════════════════════

interface SessionDangerCardProps {
  securityProfile: SecurityProfile;
  userEmail: string;
  className?: string;
}

export function SessionDangerCard({
  securityProfile,
  userEmail,
  className,
}: SessionDangerCardProps) {
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
          <span className="text-[9px] font-sans font-semibold uppercase tracking-wide text-slate-700">Sessions & Sécurité</span>
        </div>
        <span className={DS_BADGE_NEUTRAL}>{sessions.length}/2 session{sessions.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-3">
        {/* Sessions */}
        <div>
          <span className={cn(DS_LABEL, "mb-1.5 block")}>Sessions actives <span className="text-slate-400">(max 2)</span></span>
          {sessions.length === 0 && (
            <p className="text-[9px] font-sans font-medium text-slate-600">Aucune session active</p>
          )}
          <div className="flex flex-col gap-2">
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

        {/* Zone de Danger */}
        <DangerZoneCard userEmail={userEmail} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BentoSecurityCard — Version complète (legacy, gardée pour compat)
// ═══════════════════════════════════════════════════════════

interface BentoSecurityCardProps {
  securityProfile: SecurityProfile;
  userEmail: string;
  className?: string;
}

export function BentoSecurityCard({
  securityProfile,
  userEmail,
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
          <span className="text-[9px] font-sans font-semibold uppercase tracking-wide text-slate-700">Sécurité</span>
          <span className={cn(sp.emailVerified ? DS_BADGE_SUCCESS : DS_BADGE_DANGER, "text-[7px] leading-none")}>
            {sp.emailVerified ? "VÉRIFIÉ" : "EN ATTENTE"}
          </span>
        </div>
        <span className={DS_BADGE_NEUTRAL}>{sessions.length} session{sessions.length > 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-3">
        {/* Mot de passe — formulaire complet */}
        <div className="rounded-md border border-slate-200 bg-slate-50/60 px-2 py-2">
          <ChangePasswordForm passwordEnabled={sp.passwordEnabled} />
        </div>

        {/* Sessions */}
        <div>
          <span className={cn(DS_LABEL, "mb-1.5 block")}>Sessions actives</span>
          {sessions.length === 0 && (
            <p className="text-[9px] font-sans font-medium text-slate-600">Aucune session active</p>
          )}
          <div className="flex gap-2">
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

        {/* Zone de Danger */}
        <DangerZoneCard userEmail={userEmail} />
      </div>
    </div>
  );
}