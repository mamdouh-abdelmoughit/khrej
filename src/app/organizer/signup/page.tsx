"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2Icon, Loader2Icon } from "lucide-react";

const BLOCKED_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "ymail.com",
  "yahoo.fr",
  "hotmail.fr",
]);

const PROFESSIONAL_EMAIL_ERROR =
  "Utilisez une adresse email professionnelle (ex: contact@monentreprise.ma) — les emails Gmail, Yahoo et Hotmail ne sont pas acceptés";

const PHONE_ERROR = "Numéro invalide — utilisez le format 06XXXXXXXX ou 07XXXXXXXX";
const PASSWORD_ERROR = "Le mot de passe doit contenir au moins 8 caractères et un chiffre";

export default function OrganizerSignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function hasProfessionalDomain(value: string) {
    const normalized = value.toLowerCase().trim();
    const parts = normalized.split("@");

    if (parts.length !== 2 || !parts[1]) {
      return false;
    }

    return !BLOCKED_DOMAINS.has(parts[1]);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!hasProfessionalDomain(email)) {
      setError(PROFESSIONAL_EMAIL_ERROR);
      return;
    }

    if (!/^(06|07)\d{8}$/.test(phone)) {
      setError(PHONE_ERROR);
      return;
    }

    if (!/^(?=.*\d).{8,}$/.test(password)) {
      setError(PASSWORD_ERROR);
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    const emailRedirectTo = `${window.location.origin}/organizer/dashboard`;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          organization_name: organizationName,
          phone,
          role: "organizer",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess("Vérifiez votre email pour confirmer votre compte organisateur.");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <main className="container flex-1 mx-auto flex items-center justify-center p-4 py-12 md:py-20 max-w-xl">
      <Card className="w-full border-border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">Inscription Organisateur</CardTitle>
          <CardDescription className="text-center">
            Créez votre compte professionnel pour publier vos événements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                type="text"
                required
                placeholder="Ex: Sara El Idrissi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName">Nom de l&apos;organisation</Label>
              <Input
                id="organizationName"
                type="text"
                required
                placeholder="Ex: EventCo Maroc"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="contact@monentreprise.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="06XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ""))}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl" disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                  Création du compte...
                </>
              ) : (
                "Créer mon compte organisateur"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              🔒 Votre compte sera vérifié par notre équipe avant activation
            </p>
          </form>
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
