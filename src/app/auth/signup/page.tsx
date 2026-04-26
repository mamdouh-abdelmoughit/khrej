"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import Link from "next/link";

type SignupRole = "visitor" | "organizer";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [role, setRole] = useState<SignupRole | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!role) {
      setError("Choisissez d'abord votre type de compte.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const redirectPath = role === "organizer" ? "/organizer/register" : "/";
    const emailRedirectTo = `${window.location.origin}${redirectPath}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess("Vérifiez votre email pour confirmer votre compte.");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <main className="container flex-1 mx-auto flex items-center justify-center p-4 py-8 md:py-16 px-4 max-w-lg">
      <Card className="w-full border-border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">Inscription</CardTitle>
          <CardDescription className="text-center">
            Crée ton compte Khrej pour réjoindre nos événements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-6">
            <button
              type="button"
              onClick={() => setRole("visitor")}
              className={`rounded-xl border p-5 text-left transition-colors ${
                role === "visitor"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/60"
              }`}
            >
              <p className="text-base font-semibold">Je veux assister à des événements</p>
              <p className="text-sm text-muted-foreground mt-2">Compte visiteur</p>
            </button>

            <button
              type="button"
              onClick={() => setRole("organizer")}
              className={`rounded-xl border p-5 text-left transition-colors ${
                role === "organizer"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-primary/60"
              }`}
            >
              <p className="text-base font-semibold">Je veux vendre des tickets</p>
              <p className="text-sm text-muted-foreground mt-2">Compte organisateur</p>
            </button>
          </div>

          {!role && (
            <p className="text-sm text-muted-foreground text-center mb-2">
              Sélectionnez un rôle pour continuer.
            </p>
          )}

          {role && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Adam"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="El Fassi"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m.example@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm font-medium bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 text-center text-emerald-700 flex items-center justify-center gap-2">
                <CheckCircle2Icon className="h-4 w-4" />
                {success}
              </p>
            )}

            <Button type="submit" className="w-full mt-6 h-12 text-lg font-bold rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                  Création du compte...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center border-t border-border/50 pt-6">
          <span className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Se connecter
            </Link>
          </span>
        </CardFooter>
      </Card>
    </main>
  );
}