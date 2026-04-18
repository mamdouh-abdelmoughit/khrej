import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";

export default async function Home() {
  // Array of events (will fetch from Supabase later)
  const events: any[] = []; 

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-screen-xl flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl text-balance">
            Découvre les meilleurs événements au Maroc
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            Concerts, festivals, stand-up, sport... Trouve ton prochain plan sur Khrej.
          </p>
          
          <div className="flex w-full max-w-md items-center space-x-2 mt-4">
            <Input 
              type="text" 
              placeholder="Chercher par ville (ex: Casablanca, Rabat...)" 
              className="bg-background rounded-full border-primary/20 focus-visible:ring-primary/30 h-12 px-6"
            />
            <Button type="submit" className="rounded-[1rem] h-12 px-8">Chercher</Button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 max-w-screen-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">À l'affiche</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Aucun événement pour le moment</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Les organisateurs préparent de superbes expériences. Reviens très vite pour découvrir de nouveaux événements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {/* Render Event Cards Here */}
          </div>
        )}
      </section>
    </div>
  );
}import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon } from "lucide-react";

export default async function Home() {
  // We will fetch from Supabase here in the future
  const events = []; // Array of events

  return (
    <main className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-screen-xl flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl text-balance">
            D�couvre les meilleurs �v�nements au Maroc
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            Concerts, festivals, stand-up, sport... Trouve ton prochain plan sur Khrej.
          </p>
          
          <div className="flex w-full max-w-md items-center space-x-2 mt-4">
            <Input 
              type="text" 
              placeholder="Chercher par ville (ex: Casablanca, Rabat...)" 
              className="bg-background rounded-full border-primary/20 focus-visible:ring-primary/30 h-12 px-6"
            />
            <Button type="submit" className="rounded-full h-12 px-8">Chercher</Button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 max-w-screen-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">� l'affiche</h2>
        </div>
        
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Aucun �v�nement pour le moment</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Les organisateurs pr�parent de superbes exp�riences. Reviens tr�s vite pour d�couvrir de nouveaux �v�nements!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {/* Render Event Cards Here */}
          </div>
        )}
      </section>
    </main>
  );
}
