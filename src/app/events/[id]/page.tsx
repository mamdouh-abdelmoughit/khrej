import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, MapPinIcon, TicketIcon, InfoIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event || error) {
    notFound();
  }

  const isSoldOut = event.tickets_sold >= event.ticket_quantity;
  const platformFee = event.ticket_price * 0.05;
  const totalPrice = event.ticket_price + platformFee;
  const progressPercentage = Math.min((event.tickets_sold / event.ticket_quantity) * 100, 100);

  const formattedDate = format(new Date(event.event_date), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr });

  return (
    <main className="flex-1 bg-background pb-24 md:pb-12">
      {/* Cover Image */}
      <div className="w-full h-64 md:h-[400px] overflow-hidden relative bg-muted">
        {/* Placeholder for the image. Normally we'd use next/image but relying on a regular img or background for simplicity right now */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${event.cover_image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent md:hidden" />
      </div>

      <div className="container mx-auto px-4 max-w-screen-lg -mt-8 relative z-10 md:mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-balance mb-4">
                {event.title}
              </h1>
              
              <div className="flex flex-col gap-3 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span className="text-lg capitalize">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-primary" />
                  <span className="text-lg">{event.venue_name}, <span className="font-semibold text-foreground">{event.venue_city}</span></span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <InfoIcon className="w-6 h-6" /> À propos
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                {event.description}
              </p>
            </div>
          </div>

          {/* Sticky Checkout Card / Mobile Sticky Bottom */}
          <div className="md:col-span-1">
            <Card className="sticky top-24 border-border shadow-sm">
              <CardContent className="p-6 flex flex-col gap-6">
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">Prix du billet</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{totalPrice.toFixed(2)}</span>
                    <span className="text-muted-foreground font-medium">MAD</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 text-balance">
                    (Dont {event.ticket_price} MAD + {platformFee.toFixed(2)} MAD frais Khrej)
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Billets vendus</span>
                    <span>{event.tickets_sold} / {event.ticket_quantity}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  {isSoldOut ? (
                    <p className="text-destructive text-sm font-medium mt-1">Événement complet !</p>
                  ) : (
                    <p className="text-muted-foreground text-xs mt-1">Dépêche-toi, ça part vite !</p>
                  )}
                </div>

                {/* Mobile Sticky Button Wrapper */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border/50 md:relative md:p-0 md:bg-transparent md:border-none z-50">
                  {isSoldOut ? (
                    <Button disabled className="w-full rounded-xl h-14 text-lg bg-muted text-muted-foreground">
                      Complet
                    </Button>
                  ) : (
                    <Link href={`/checkout/${event.id}`} className="w-full block">
                      <Button className="w-full rounded-xl h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all">
                        <TicketIcon className="w-5 h-5 mr-2" />
                        Acheter mon ticket — {totalPrice.toFixed(2)} MAD
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}