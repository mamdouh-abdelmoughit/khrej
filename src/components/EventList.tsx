"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  venue_city: string;
  venue_name: string;
  event_date: string;
  ticket_price: number;
  ticket_quantity: number;
  tickets_sold: number;
  cover_image_url: string;
}

export function EventList({ initialEvents }: { initialEvents: Event[] }) {
  const [selectedCity, setSelectedCity] = useState("Tous");
  
  const cities = ["Tous", "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"];
  
  const filteredEvents = selectedCity === "Tous" 
    ? initialEvents 
    : initialEvents.filter(event => event.venue_city.toLowerCase() === selectedCity.toLowerCase());

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 md:mb-12">
        {cities.map((city) => (
          <Button 
            key={city} 
            variant={city === selectedCity ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setSelectedCity(city)}
          >
            {city}
          </Button>
        ))}
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Aucun événement pour le moment</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Revenez bientôt 👀
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {filteredEvents.map((event) => {
            const ticketsRemaining = event.ticket_quantity - event.tickets_sold;
            
            return (
            <Link href={`/events/${event.id}`} key={event.id} className="group flex flex-col gap-3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
                {event.cover_image_url ? (
                  <Image 
                    src={event.cover_image_url} 
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 opacity-50" />
                  </div>
                )}
                {ticketsRemaining > 0 && ticketsRemaining <= 20 && (
                  <Badge variant="destructive" className="absolute top-3 left-3 font-semibold">
                    Derniers tickets
                  </Badge>
                )}
                {ticketsRemaining <= 0 && (
                  <Badge variant="secondary" className="absolute top-3 left-3 font-semibold bg-black/50 text-white backdrop-blur-md border-0">
                    Complet
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1 px-1">
                <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center text-muted-foreground gap-1.5 text-sm font-medium">
                  <MapPinIcon className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{event.venue_name}, {event.venue_city}</span>
                </div>
                <div className="flex items-center text-muted-foreground gap-1.5 text-sm font-medium border-b border-border/50 pb-2 mb-1">
                  <CalendarIcon className="w-4 h-4 shrink-0" />
                  <span className="capitalize">
                    {format(new Date(event.event_date), "EEEE d MMMM 'à' HH'h'mm", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-lg font-bold">{event.ticket_price.toFixed(2)} MAD</span>
                  {ticketsRemaining > 0 ? (
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                      {ticketsRemaining} restants
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                      Complet
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )})}
        </div>
      )}
    </>
  );
}