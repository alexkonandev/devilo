"use server";

import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateCompanyLogo(url: string) {
  try {
    const userId = await getClerkUserId();

    if (!userId) {
      console.error(" [AUTH_ERROR]: No userId found in action");
      return { success: false };
    }

    console.log(
      ` [DB_UPDATE]: Attempting to save URL ${url} for user ${userId}`
    );

    await db.user.update({
      where: { id: userId },
      data: { companyLogo: url },
    });

    console.log(" [DB_SUCCESS]: URL saved in Prisma");

    revalidatePath("/settings");

    return { success: true };
  } catch (error) {
    console.error(" [PRISMA_ERROR]:", error);
    return { success: false };
  }
}