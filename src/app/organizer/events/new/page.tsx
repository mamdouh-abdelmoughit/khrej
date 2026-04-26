import { AlertCircleIcon } from "lucide-react";
import { protectOrganizerRoute } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import CreateEventForm from "./create-event-form";

export default async function CreateEventPage() {
  const user = await protectOrganizerRoute();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_verified")
    .eq("id", user.id)
    .single();

  if (!profile?.is_verified) {
    return (
      <main className="container mx-auto px-4 max-w-2xl py-16">
        <div className="rounded-2xl border border-amber-300/40 bg-amber-50 p-8 shadow-sm">
          <p className="text-2xl font-bold text-amber-900 flex items-center gap-3">
            <AlertCircleIcon className="h-6 w-6" />
            Compte en cours de vérification ⏳
          </p>
          <p className="mt-3 text-amber-800">
            Votre compte est en cours de vérification. Vous recevrez un email sous 24h.
          </p>
        </div>
      </main>
    );
  }

  return <CreateEventForm />;
}
