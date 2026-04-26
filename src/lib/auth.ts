import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function protectOrganizerRoute() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Allow /organizer/register to be accessed without being an organizer yet.
  const isRegisterRoute = headers().get("x-invoke-path")?.includes("/organizer/register");
  
  if (!isRegisterRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "organizer") {
      redirect("/");
    }
  }

  return user;
}