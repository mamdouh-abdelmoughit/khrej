"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type UserRole = "visitor" | "organizer";

type UserMenuProps = {
  role: UserRole;
  fullName: string | null;
  organizationName: string | null;
};

export function UserMenu({ role, fullName, organizationName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const displayName = useMemo(() => {
    if (role === "organizer") {
      return organizationName || fullName || "Organisateur";
    }

    return fullName || "Utilisateur";
  }, [role, fullName, organizationName]);

  const avatarSource = (fullName || organizationName || "?").trim();
  const avatarLetter = avatarSource.length > 0 ? avatarSource[0].toUpperCase() : "?";

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Ouvrir le menu utilisateur"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-10 w-10 rounded-full bg-[#E8450A] text-white font-bold flex items-center justify-center"
      >
        {avatarLetter}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-background shadow-lg py-2 z-50">
          <p className="px-4 py-2 text-sm font-semibold text-foreground border-b border-border/60">
            {displayName}
          </p>

          {role === "organizer" ? (
            <>
              <Link
                href="/organizer/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-muted"
              >
                Mon dashboard
              </Link>
              <Link
                href="/organizer/events/new"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-muted"
              >
                Créer un événement
              </Link>
            </>
          ) : (
            <Link
              href="/mes-tickets"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-muted"
            >
              Mes tickets
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
