"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, BuildingIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/auth/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "organizer", full_name: companyName })
      .eq("id", user.id);

    if (updateError) {
      setError("Erreur lors de la mise à jour de votre profil.");
      setLoading(false);
      return;
    }

    router.push("/organizer/dashboard");
    router.refresh();
  };

  return (
    <main className="container flex-1 mx-auto flex items-center justify-center p-4 py-16 md:py-24 px-4 max-w-lg">
      <Card className="w-full border-border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">
            Devenir Organisateur
          </CardTitle>
          <CardDescription className="text-center">
            Crée et gère tes propres événements sur Khrej
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l&apos;organisation / entreprise</Label>
              <div className="relative">
                <BuildingIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Ex: Khrej Events"
                  required
                  className="pl-10"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>
            
            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-6 h-12 text-lg font-bold rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte organisateur"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}