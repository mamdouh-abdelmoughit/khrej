"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftIcon, UploadCloudIcon } from "lucide-react";
import Link from "next/link";

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Autre"];

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate Supabase API Call here
    // const formData = new FormData(e.currentTarget);
    // await createEventAction(formData);
    
    setTimeout(() => {
      setIsLoading(false);
      // Toast notification would go here
      router.push("/organizer/dashboard");
    }, 1500);
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

      <form onSubmit={onSubmit}>
        <Card className="rounded-2xl border-border/50 overflow-hidden shadow-sm">
          <CardContent className="p-6 md:p-8 flex flex-col gap-8">
            
            {/* Step 1: Image & Description */}
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold border-b border-border/40 pb-2">1. Informations générales</h2>
              
              <div className="grid gap-2">
                <Label htmlFor="title">Titre de l&apos;événement <span className="text-destructive">*</span></Label>
                <Input id="title" name="title" placeholder="Ex: L'Art du Stand Up" required className="h-12 rounded-xl" />
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
                <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer text-center">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <UploadCloudIcon className="w-6 h-6" />
                  </div>
                  <p className="font-medium text-sm mt-2">Cliquez pour uploader une image</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP jusqu&apos;à 5MB</p>
                  <Input id="cover_image" name="cover_image" type="file" accept="image/*" className="hidden" />
                </div>
              </div>
            </div>

            {/* Step 2: Date & Lieu */}
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
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Step 3: Billetterie */}
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold border-b border-border/40 pb-2">3. Billetterie</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="ticket_price">Prix du billet (MAD) <span className="text-destructive">*</span></Label>
                  <Input type="number" step="0.01" min="0" id="ticket_price" name="ticket_price" placeholder="Ex: 150.00" required className="h-12 rounded-xl" />
                  <p className="text-xs text-muted-foreground">La commission de 5% sera payée par l&apos;acheteur, vous toucherez 100% de ce prix.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ticket_quantity">Quantité de billets <span className="text-destructive">*</span></Label>
                  <Input type="number" min="1" id="ticket_quantity" name="ticket_quantity" placeholder="Ex: 200" required className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

          </CardContent>
          <CardFooter className="p-6 md:p-8 bg-muted/20 border-t border-border/50 flex justify-end gap-4">
            <Link href="/organizer/dashboard">
              <Button type="button" variant="ghost" className="h-12 px-6 rounded-xl font-semibold">Annuler</Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="h-12 px-8 rounded-xl font-bold text-base shadow-md">
              {isLoading ? "Création en cours..." : "Créer l'événement"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}