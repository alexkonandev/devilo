import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getClerkUserId: vi.fn(),
}));

// Mise à jour du mock Prisma pour inclure tous les modèles utilisés
vi.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    quote: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    client: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    clientActivity: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    userService: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    theme: { findMany: vi.fn(), create: vi.fn() },
    // AJOUTER CES DEUX LIGNES :
    catalogOffer: { create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}));
