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
  "/terms(.*)",
  "/favicon.ico",
]);

// ─── Routes Onboarding ────────────────────────────────────────────────────────
const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"]);

// ─── Routes API protégées ─────────────────────────────────────────────────────
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

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

  // 2. Routes non-publiques : protéger
  if (!isPublicRoute(req)) {
    const { userId, redirectToSignIn } = await auth();

    // Rediriger vers la page de connexion si non authentifié
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // 3. Rediriger vers l'onboarding si l'utilisateur ne l'a pas terminé
    //    (sauf s'il est déjà sur la page d'onboarding)
    if (!isOnboardingRoute(req)) {
      try {
        const db = (await import("@/lib/prisma")).default;
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { isOnboarded: true },
        });

        if (user && !user.isOnboarded) {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
      } catch {
        // Si la DB est inaccessible, on laisse passer
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};