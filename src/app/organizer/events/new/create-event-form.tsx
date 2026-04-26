"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircleIcon, ArrowLeftIcon, Loader2Icon, UploadCloudIcon } from "lucide-react";
import Link from "next/link";
import { createEventAction } from "./actions";

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fes", "Tanger", "Agadir", "Autre"];

export default function CreateEventForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setToastMessage(null);

    try {
      const formData = new FormData(e.currentTarget);
      await createEventAction(formData);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "digest" in err &&
        typeof (err as { digest?: unknown }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }

      if (err instanceof Error) {
        setError(err.message);
        setToastMessage(err.message);
      } else {
        const fallbackMessage = "Une erreur est survenue";
        setError(fallbackMessage);
        setToastMessage(fallbackMessage);
      }

      setTimeout(() => setToastMessage(null), 4500);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container mx-auto px-4 max-w-3xl py-8 md:py-12 flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/organizer/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Nouvel événement</h1>
          <p className="text-muted-foreground text-sm">Créez votre événement et commencez à vendre des billets.</p>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-lg">
          <p className="font-semibold flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4" />
            Échec de la création
          </p>
          <p className="mt-1 break-words">{toastMessage}</p>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <Card className="rounded-2xl border-border/50 overflow-hidden shadow-sm">
          <CardContent className="p-6 md:p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold border-b border-border/40 pb-2">1. Informations générales</h2>

              <div className="grid gap-2">
                <Label htmlFor="title">Titre de l&apos;événement <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" placeholder="Ex: L&apos;Art du Stand Up" required className="h-12 rounded-xl" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez votre événement en détail..."
                  className="min-h-[120px] rounded-xl resize-y"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Image de couverture <span className="text-destructive">*</span></Label>
                <label htmlFor="cover_image" className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer text-center">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <UploadCloudIcon className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-sm mt-2">Cliquez pour uploader une image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP jusqu&apos;à 5MB</p>
                  <Input id="cover_image" name="cover_image" type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold border-b border-border/40 pb-2">2. Date et Lieu</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="event_date">Date et Heure <span className="text-destructive">*</span></Label>
                  <Input type="datetime-local" id="event_date" name="event_date" required className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="venue_name">Nom du lieu <span className="text-destructive">*</span></Label>
                  <Input id="venue_name" name="venue_name" placeholder="Ex: Théâtre Mohammed V" required className="h-12 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="venue_city">Ville <span className="text-destructive">*</span></Label>
                  <Select name="venue_city" required>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold border-b border-border/40 pb-2">3. Billets</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="ticket_price">Prix du billet (MAD) <span className="text-destructive">*</span></Label>
                  <Input type="number" id="ticket_price" name="ticket_price" placeholder="Ex: 150" required min="0" step="0.01" className="h-12 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ticket_quantity">Quantité de billets <span className="text-destructive">*</span></Label>
                  <Input type="number" id="ticket_quantity" name="ticket_quantity" placeholder="Ex: 200" required min="1" className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="mt-4 h-14 rounded-xl font-bold text-lg">
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                  Création en cours...
                </span>
              ) : (
                "Publier l&apos;événement"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </main>
  );
}
