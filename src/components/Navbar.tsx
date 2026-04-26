import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "visitor" | "organizer" | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "organizer") {
      role = "organizer";
    } else {
      role = "visitor";
    }
  }

  const createEventHref = role === "organizer" ? "/organizer/events/new" : "/organizer/signup";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">Khrej</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href={createEventHref} className="hidden md:block">
            <Button variant="ghost" className="font-semibold">
              Créer un événement
            </Button>
          </Link>

          {!user ? (
            <Link href="/auth/login">
              <Button variant="default" className="font-semibold rounded-xl">
                Connexion
              </Button>
            </Link>
          ) : role === "organizer" ? (
            <Link href="/organizer/dashboard">
              <Button variant="default" className="font-semibold rounded-xl">
                Mon dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/mes-tickets">
              <Button variant="default" className="font-semibold rounded-xl">
                Mes tickets
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}