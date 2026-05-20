import { describe, it, expect, vi, beforeEach } from "vitest";
import db from "@/lib/prisma";
import * as authModule from "@/lib/auth";
import {
  getInventoryAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from "../catalog-action";

describe("Catalog Actions - Business Logic Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getInventoryAction", () => {
    it("devrait retourner des listes vides si non authentifié", async () => {
      vi.mocked(authModule.getClerkUserId).mockResolvedValue(null);

      const res = await getInventoryAction();
      expect(res).toEqual({ userServices: [], platformServices: [] });
      expect(db.userService.findMany).not.toHaveBeenCalled();
      expect(db.catalogOffer.findMany).not.toHaveBeenCalled();
    });

    it("devrait appeler userService.findMany et catalogOffer.findMany si authentifié", async () => {
      vi.mocked(authModule.getClerkUserId).mockResolvedValue("user_123");
      vi.mocked(db.userService.findMany as any).mockResolvedValue([]);
      vi.mocked(db.catalogOffer.findMany as any).mockResolvedValue([]);

      await getInventoryAction();

      expect(db.userService.findMany).toHaveBeenCalledWith({
        where: { userId: "user_123" },
        orderBy: { title: "asc" },
      });
      expect(db.catalogOffer.findMany).toHaveBeenCalledWith({
        orderBy: { category: "asc" },
      });
    });
  });

  describe("createServiceAction", () => {
    it("devrait rejeter l'opération si l'utilisateur n'est pas authentifié", async () => {
      vi.mocked(authModule.getClerkUserId).mockResolvedValue(null);

      const result = await createServiceAction({ title: "SEO", unitPrice: 500 });
      expect(result.success).toBe(false);
      expect(result.error).toBe("AUTH_REQUIRED");
    });
  });

  describe("updateServiceAction / deleteServiceAction", () => {
    it("devrait rejeter l'opération si l'utilisateur n'est pas authentifié", async () => {
      vi.mocked(authModule.getClerkUserId).mockResolvedValue(null);

      const u = await updateServiceAction("svc_1", { title: "X" });
      expect(u.success).toBe(false);
      expect(u.error).toBe("AUTH_REQUIRED");

      const d = await deleteServiceAction("svc_1");
      expect(d.success).toBe(false);
      expect(d.error).toBe("AUTH_REQUIRED");
    });
  });
});