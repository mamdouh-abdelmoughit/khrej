import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { UserMenu } from "@/components/UserMenu";

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "visitor" | "organizer" | null = null;
  let fullName: string | null = null;
  let organizationName: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, organization_name")
      .eq("id", user.id)
      .single();

    if (profile?.role === "organizer") {
      role = "organizer";
    } else {
      role = "visitor";
    }

    fullName = profile?.full_name ?? null;
    organizationName = profile?.organization_name ?? null;
  }

  const createEventHref = role === "organizer" ? "/organizer/events/new" : "/organizer/signup";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">Khrej</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href={createEventHref} className="font-semibold text-sm hover:text-primary transition-colors">
            <span>
              Créer un événement
            </span>
          </Link>

          {!user ? (
            <Link href="/auth/login">
              <Button variant="default" className="font-semibold rounded-xl bg-[#E8450A] hover:bg-[#cf3d08] text-white">
                Connexion
              </Button>
            </Link>
          ) : role ? (
            <UserMenu role={role} fullName={fullName} organizationName={organizationName} />
          ) : null}
        </div>
      </div>
    </nav>
  );
}