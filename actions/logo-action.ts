"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateCompanyLogo(url: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error(" [AUTH_ERROR]: No userId found in action");
      return { success: false };
    }

    console.log(
      ` [DB_UPDATE]: Attempting to save URL ${url} for user ${userId}`
    );

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { companyLogo: url },
    });

    console.log(" [DB_SUCCESS]: URL saved in Prisma");

    // RECTIFICATION DU CHEMIN ICI
    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error(" [PRISMA_ERROR]:", error);
    return { success: false };
  }
}
