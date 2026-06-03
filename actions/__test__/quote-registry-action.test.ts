import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getQuotesAction,
  updateQuoteStatusAction,
  deleteQuoteAction,
  getQuoteTimelineAction,
} from "../quote-registry-action";
import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";

// On mocke le module quote-event-action
vi.mock("../quote-event-action", () => ({
  logQuoteEventAction: vi.fn().mockResolvedValue(undefined),
  logQuoteStatusChangeAction: vi.fn().mockResolvedValue(undefined),
  getQuoteEventsAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

describe("Quote Registry Actions - Business Logic Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── getQuotesAction ───────────────────────────────

  describe("getQuotesAction", () => {
    it("devrait retourner une erreur si l'utilisateur n'est pas authentifié", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await getQuotesAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
      expect(db.quote.findMany).not.toHaveBeenCalled();
    });

    it("devrait retourner la liste des devis de l'utilisateur", async () => {
      const mockUserId = "user_test_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);

      const mockQuotes = [
        { id: "q1", userId: mockUserId, number: "D-001", title: "Devis 1", client: { name: "Client A" }, lines: [] },
        { id: "q2", userId: mockUserId, number: "D-002", title: "Devis 2", client: { name: "Client B" }, lines: [] },
      ];
      (db.quote.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockQuotes);

      const result = await getQuotesAction();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockQuotes);
      expect(db.quote.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        include: { client: true, lines: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("devrait gérer les erreurs Prisma", async () => {
      const mockUserId = "user_test_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);
      (db.quote.findMany as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));

      const result = await getQuotesAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Impossible de charger les devis");
    });
  });

  // ─── updateQuoteStatusAction ───────────────────────

  describe("updateQuoteStatusAction", () => {
    it("devrait retourner une erreur si l'utilisateur n'est pas authentifié", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await updateQuoteStatusAction("q1", "PAID");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("devrait retourner une erreur si l'ID est vide (validation Zod)", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("user_test_123");

      const result = await updateQuoteStatusAction("", "PAID");

      expect(result.success).toBe(false);
      expect(result.error).toContain("requis");
    });

    it("devrait retourner une erreur si le statut est invalide (validation Zod)", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("user_test_123");

      const result = await updateQuoteStatusAction("q1", "INVALID" as never);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid enum value");
    });

    it("devrait retourner une erreur si le devis n'existe pas", async () => {
      const mockUserId = "user_test_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);
      (db.quote.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await updateQuoteStatusAction("nonexistent", "PAID");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Devis non trouvé");
    });

    it("devrait mettre à jour le statut avec succès", async () => {
      const mockUserId = "user_test_123";
      const quoteId = "q1";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);

      const existingQuote = { id: quoteId, status: "DRAFT" };
      (db.quote.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(existingQuote);
      (db.quote.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ ...existingQuote, status: "PAID" });

      const result = await updateQuoteStatusAction(quoteId, "PAID");

      expect(result.success).toBe(true);
      expect(db.quote.update).toHaveBeenCalledWith({
        where: { id: quoteId, userId: mockUserId },
        data: { status: "PAID" },
      });
    });
  });

  // ─── deleteQuoteAction ─────────────────────────────

  describe("deleteQuoteAction", () => {
    it("devrait retourner une erreur si l'utilisateur n'est pas authentifié", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await deleteQuoteAction("q1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("devrait retourner une erreur si l'ID est vide (validation Zod)", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("user_test_123");

      const result = await deleteQuoteAction("");

      expect(result.success).toBe(false);
      expect(result.error).toContain("requis");
    });

    it("devrait supprimer le devis avec succès", async () => {
      const mockUserId = "user_test_123";
      const quoteId = "q1";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);
      (db.quote.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: quoteId });

      const result = await deleteQuoteAction(quoteId);

      expect(result.success).toBe(true);
      expect(db.quote.delete).toHaveBeenCalledWith({
        where: { id: quoteId, userId: mockUserId },
      });
    });

    it("devrait gérer les erreurs Prisma", async () => {
      const mockUserId = "user_test_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);
      (db.quote.delete as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));

      const result = await deleteQuoteAction("q1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Erreur lors de la suppression");
    });
  });

  // ─── getQuoteTimelineAction ────────────────────────

  describe("getQuoteTimelineAction", () => {
    it("devrait retourner une erreur si l'utilisateur n'est pas authentifié", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await getQuoteTimelineAction("q1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("devrait retourner une erreur si le devis n'existe pas", async () => {
      const mockUserId = "user_test_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);
      (db.quote.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const result = await getQuoteTimelineAction("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Devis non trouvé");
    });

    it("devrait retourner une timeline synthétique si aucun événement n'existe", async () => {
      const mockUserId = "user_test_123";
      const quoteId = "q1";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockUserId);

      const mockQuote = {
        id: quoteId,
        createdAt: new Date("2025-01-15T10:00:00Z"),
        status: "DRAFT",
        updatedAt: new Date("2025-01-15T10:00:00Z"),
      };
      (db.quote.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockQuote);

      const result = await getQuoteTimelineAction(quoteId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0].type).toBe("created");
      expect(result.data![0].quoteId).toBe(quoteId);
    });
  });
});