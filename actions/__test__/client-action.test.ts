import { describe, it, expect, vi, beforeEach } from "vitest";
import { getClients, upsertClient } from "../client-action";
import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";

describe("Client Actions - Business Logic Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getClients", () => {
    it("devrait retourner une liste vide si l'utilisateur n'est pas authentifié", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        null
      );

      const result = await getClients();

      expect(result).toEqual([]);
      expect(db.client.findMany).not.toHaveBeenCalled();
    });

    it("devrait filtrer les clients par userId pour garantir l'étanchéité des données", async () => {
      const mockUserId = "user_nomad_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUserId
      );
      (db.client.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        []
      );

      await getClients();

      expect(db.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          orderBy: { name: "asc" },
          include: expect.any(Object),
        })
      );
    });
  });

  describe("upsertClient", () => {
    const validClientData = {
      name: "Acme Corp",
      email: "contact@acme.com",
      address: "123 Rue du Succès",
      taxId: "CI-ABC-2024-A-12345",
    };

    it("devrait rejeter l'opération si l'utilisateur n'est pas authentifié", async () => {
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        null
      );

      const result = await upsertClient(validClientData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Non autorisé");
    });

    it("devrait créer un client avec le userId de la session", async () => {
      const mockUserId = "user_nomad_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUserId
      );

      await upsertClient(validClientData);

      expect(db.client.create).toHaveBeenCalledWith({
        data: {
          name: validClientData.name,
          email: validClientData.email,
          phone: null,
          address: validClientData.address,
          addressLine2: null,
          city: null,
          postalCode: null,
          country: "CI",
          taxId: validClientData.taxId,
          tvaNumber: null,
          legalForm: null,
          representativeName: null,
          representativePosition: null,
          notes: null,
          tags: [],
          userId: mockUserId,
        },
      });
    });

    it("devrait mettre à jour un client existant en vérifiant le userId", async () => {
      const mockUserId = "user_nomad_123";
      const clientId = "client_abc_123";
      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUserId
      );

      await upsertClient({ id: clientId, ...validClientData });

      expect(db.client.update).toHaveBeenCalledWith({
        where: { id: clientId, userId: mockUserId },
        data: {
          name: validClientData.name,
          email: validClientData.email,
          phone: null,
          address: validClientData.address,
          addressLine2: null,
          city: null,
          postalCode: null,
          country: "CI",
          taxId: validClientData.taxId,
          tvaNumber: null,
          legalForm: null,
          representativeName: null,
          representativePosition: null,
          notes: null,
          tags: [],
          userId: mockUserId,
        },
      });
    });
  });
});
