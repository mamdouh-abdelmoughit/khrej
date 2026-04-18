import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-primary">Khrej</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/organizer/register" className="hidden md:block">
            <Button variant="ghost" className="font-semibold">
              Créer un événement
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="default" className="font-semibold rounded-xl">
              Connexion
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}