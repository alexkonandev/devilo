import { getClerkUserId } from "@/lib/auth";
import db from "@/lib/prisma";

export const getApiLimitCount = async (): Promise<number> => {
  const userId = await getClerkUserId();

  if (!userId) return 0;

  try {
    if (!("userApiLimit" in db)) {
      console.warn(
        "⚠️ [DATABASE] Table 'userApiLimit' non détectée au runtime."
      );
      return 0;
    }
    const userApiLimit = await db.userApiLimit.findUnique({
      where: { userId },
    });

    return userApiLimit ? userApiLimit.count : 0;
  } catch (error) {
    console.error("❌ [API LIMIT ERROR]:", error);
    return 0;
  }
};
