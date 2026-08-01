import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ─── Routes Publiques (accessibles sans authentification) ─────────────────────
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api/webhooks(.*)",
  "/api/uploadthing(.*)",
  "/api/print(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/legal(.*)",
  "/terms(.*)",
  "/favicon.ico",
]);

// ─── Routes API protégées ─────────────────────────────────────────────────────
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

// ─── Routes d'authentification (uniquement pour les invités) ──────────────────
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/sso-callback(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Routes API protégées : bloquer si non authentifié
  if (isApiRoute(req) && !isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 },
      );
    }
  }

  // 2. Routes d'authentification : rediriger vers /home si déjà connecté
  if (isAuthRoute(req)) {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  // 3. Routes non-publiques : protéger
  if (!isPublicRoute(req)) {
    const { userId, redirectToSignIn } = await auth();

    // Rediriger vers la page de connexion si non authentifié
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};