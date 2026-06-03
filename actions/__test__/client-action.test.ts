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

      // Le userId est injecté via user.connect côté serveur, pas dans le payload direct
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
          user: {
            connect: { id: mockUserId },
          },
        },
      });
    });

    it("devrait mettre à jour un client existant en vérifiant le userId", async () => {
      const mockUserId = "user_nomad_123";
      const clientId = "client_abc_123";
      const mockUpdatedAt = new Date("2026-01-01T00:00:00Z");

      // Simuler un client existant (merge attendu)
      const existingClient = {
        id: clientId,
        name: "Old Name",
        email: "old@email.com",
        phone: "+22500000000",
        address: "Old Address",
        addressLine2: null,
        city: "Abidjan",
        postalCode: "00225",
        country: "CI",
        taxId: "CI-OLD",
        tvaNumber: null,
        legalForm: "SARL",
        representativeName: "Old Rep",
        representativePosition: "DG",
        notes: "Old notes",
        tags: ["VIP"],
        userId: mockUserId,
        updatedAt: mockUpdatedAt,
      };

      (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockUserId
      );
      (db.client.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        existingClient
      );

      // Mock update pour retourner le client mis à jour (évite l'erreur optimistic locking)
      (db.client.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        { ...existingClient, name: validClientData.name }
      );

      await upsertClient({ id: clientId, ...validClientData });

      // Vérifie que findFirst a été appelé avant l'update
      expect(db.client.findFirst).toHaveBeenCalledWith({
        where: { id: clientId, userId: mockUserId },
      });

      // L'optimistic locking utilise updatedAt dans le where
      // Le userId n'est pas dans le data (il est déjà garanti par le where)
      expect(db.client.update).toHaveBeenCalledWith({
        where: { id: clientId, updatedAt: mockUpdatedAt },
        data: {
          name: validClientData.name,          // fourni → modifié
          email: validClientData.email,        // fourni → modifié
          phone: existingClient.phone,         // NON fourni → préservé
          address: validClientData.address,    // fourni → modifié
          addressLine2: existingClient.addressLine2, // NON fourni → préservé
          city: existingClient.city,           // NON fourni → préservé
          postalCode: existingClient.postalCode, // NON fourni → préservé
          country: existingClient.country,     // NON fourni → préservé
          taxId: validClientData.taxId,        // fourni → modifié
          tvaNumber: existingClient.tvaNumber, // NON fourni → préservé
          legalForm: existingClient.legalForm, // NON fourni → préservé
          representativeName: existingClient.representativeName, // NON fourni → préservé
          representativePosition: existingClient.representativePosition, // NON fourni → préservé
          notes: existingClient.notes,         // NON fourni → préservé
          tags: existingClient.tags,           // NON fourni → préservé
        },
      });
    });
  });
});