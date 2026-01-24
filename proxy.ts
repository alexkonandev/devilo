import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Routes accessibles sans être connecté
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api/webhook(.*)",
  "/aide(.*)",
  "/contact(.*)",
  "/api/uploadthing(.*)", // <--- AJOUTE ÇA MAINTENANT
  "/mentions-legales(.*)",
  "/confidentialite(.*)",
  "/conditions-generales(.*)",
]);

// 2. Route spécifique de configuration initiale
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware(async (auth, request) => {
  const session = await auth();
  const { userId, sessionClaims } = session;

  // CAS 1 : Utilisateur non connecté sur une page privée
  if (!userId && !isPublicRoute(request)) {
    return session.redirectToSignIn({ returnBackUrl: request.url });
  }

  // CAS 2 : Utilisateur connecté
  if (userId) {
    // On récupère le statut d'onboarding depuis les métadonnées de la session Clerk
    // Note : public_metadata est plus rapide que de requêter Prisma à chaque page
    const isOnboarded = sessionClaims?.metadata?.onboardingComplete;

    // A. S'il n'a pas fini l'onboarding et n'y est pas encore : on l'y force
    if (
      !isOnboarded &&
      !isOnboardingRoute(request) &&
      !isPublicRoute(request)
    ) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    // B. S'il a fini l'onboarding mais essaie d'y retourner ou va sur l'accueil : direct au Dashboard
    if (
      isOnboarded &&
      (isOnboardingRoute(request) || request.nextUrl.pathname === "/")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
