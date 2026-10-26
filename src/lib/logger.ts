import { supabase } from "@/src/lib/supabase";

export const logActivity = async (userId: string | null, activityType: string, description: string) => {
  try {
    await supabase.from("activity_logs").insert([
      {
        user_id: userId || null,
        activity_type: activityType,
        description: description,
      },
    ]);
  } catch (error) {
    console.error("Gagal mencatat log aktivitas:", error);
  }
};