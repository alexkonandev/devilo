import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getClerkUserId } from "@/lib/auth";
import db from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  companyLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const userId = await getClerkUserId();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Cette partie ne s'exécutait pas car le middleware bloquait le POST
      console.log(
        " [SERVER]: Webhook reçu pour l'utilisateur:",
        metadata.userId
      );

      await db.user.update({
        where: { id: metadata.userId },
        data: { companyLogo: file.ufsUrl || file.url },
      });

      console.log(" [SERVER]: Prisma mis à jour avec succès.");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;