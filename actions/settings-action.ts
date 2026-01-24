"use server";

import db from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/validations/settings";

export async function updateSettings(rawData: unknown) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "UNAUTHORIZED_ACCESS" };

    // 1. Validation Zod
    const validated = settingsSchema.parse(rawData);

    const cleanData = Object.fromEntries(
      Object.entries(validated).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    // 3. Update atomique
    await db.user.update({
      where: { id: userId },
      data: cleanData,
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("[SETTINGS_SYNC_CRITICAL_ERROR]:", error);
    return { success: false, error: "SYNC_FAILED" };
  }
}
