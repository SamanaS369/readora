import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error:", error);
    return null;
  }

  return user;
}

export async function getUserPlan(userId) {
  if (!userId) return "free";

  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Profile error:", error);
    return "free";
  }

  return data?.plan || "free";
}

export async function isPremiumUser(userId) {
  const plan = await getUserPlan(userId);
  return plan === "premium";
}