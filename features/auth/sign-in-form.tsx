"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, RocketLaunch, Spinner } from "@phosphor-icons/react";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { DS_INPUT, DS_BUTTON, DS_BUTTON_SECONDARY } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isLoaded) return null;

  const signInWithGoogle = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      console.error(err);
      setError("ERREUR_SSO : ECHEC_IDENTIFICATION");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("AUTHENTIFICATION_MULTIF_REQUISE");
      }
    } catch (err: unknown) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.message || "IDENTIFIANTS_INVALIDES");
      } else {
        setError("IDENTIFIANTS_INVALIDES_OU_INCONNUS");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-8">
      {/* En-tête */}
      <div className="space-y-3">
       
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--lp-text)]">
            Connexion
          </h1>
          <p className="text-sm text-zinc-400">
            Accédez à votre espace de gestion
          </p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full bg-[var(--lp-card)] border border-[var(--lp-border)] px-3 py-2 font-mono text-sm text-[var(--lp-text)] placeholder-zinc-500 focus:border-[var(--lp-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--lp-accent)] transition-all rounded-lg"
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full bg-[var(--lp-card)] border border-[var(--lp-border)] px-3 py-2 font-mono text-sm text-[var(--lp-text)] placeholder-zinc-500 focus:border-[var(--lp-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--lp-accent)] transition-all rounded-lg"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-800 bg-red-900/20 px-4 py-3">
            <p className="text-xs font-medium text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--lp-accent)] text-white font-medium hover:opacity-90 transition-all shadow-[0_0_20px_var(--lp-accent-glow)] disabled:opacity-50"
        >
          {loading ? (
            <Spinner className="animate-spin h-4 w-4" />
          ) : (
            <>
              Se connecter
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="relative flex items-center">
        <div className="flex-grow border-t border-[var(--lp-border)]" />
        <span className="flex-shrink mx-4 text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
          Ou
        </span>
        <div className="flex-grow border-t border-[var(--lp-border)]" />
      </div>

      <button
        onClick={signInWithGoogle}
        type="button"
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-zinc-300 border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continuer avec Google
      </button>

      <p className="text-center text-xs text-zinc-500">
        Pas encore de compte ?{" "}
        <Link
          href="/sign-up"
          className="text-[var(--lp-accent)] hover:underline font-medium"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}