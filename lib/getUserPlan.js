import { supabase } from "@/lib/supabase";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserPlan() {
  try {
    // Get logged-in Supabase user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // No logged-in user
    if (!user) {
      return {
        user: null,
        plan: "free",
        isPremium: false,
      };
    }

    // Find user's profile
    const result = await db
      .select({
        id: profiles.id,
        plan: profiles.plan,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (result.length === 0) {
      return {
        user,
        plan: "free",
        isPremium: false,
      };
    }

    const plan = result[0].plan || "free";

    return {
      user,
      plan,
      isPremium: plan === "premium",
    };
  } catch (error) {
    console.error("Error getting user plan:", error);

    return {
      user: null,
      plan: "free",
      isPremium: false,
    };
  }
}