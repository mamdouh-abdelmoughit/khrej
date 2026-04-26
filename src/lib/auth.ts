import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function protectOrganizerRoute() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "organizer") {
    redirect("/");
  }

  return user;
}