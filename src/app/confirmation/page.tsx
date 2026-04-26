import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2Icon, TicketIcon, DownloadIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function ConfirmationPage({ searchParams }: { searchParams: { orderId: string } }) {
  const orderId = searchParams.orderId || "";
  const supabase = createClient();
  
  let orderData = null;

  if (orderId) {
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        events (
          title,
          event_date,
          venue_name,
          venue_city
        )
      `)
      .eq("id", orderId)
      .single();
    orderData = data;
  }

  if (!orderData) {
    return (
      <main className="container mx-auto px-4 max-w-screen-md py-16 flex flex-col items-center gap-8 text-center">
        <h1 className="text-3xl font-bold">Commande non trouvée</h1>
        <Link href="/">
          <Button variant="outline">Retour à l&apos;accueil</Button>
        </Link>
      </main>
    );
  }

  const { events: event } = orderData as { events: { title: string, event_date: string, venue_name: string, venue_city: string } };

  return (
    <main className="container mx-auto px-4 max-w-screen-md py-16 md:py-24 flex flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <CheckCircle2Icon className="w-24 h-24 text-green-500" />
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-balance">
          Mhjouz! 🎉
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mt-2 max-w-lg text-balance">
          Ta place est confirmée. Prépare-toi à vivre une super expérience !
        </p>
      </div>

      <Card className="w-full border-border shadow-sm mt-8 border-2">
        <CardHeader className="bg-primary/5 border-b border-border/50 pb-6">
          <CardTitle className="text-xl flex justify-center items-center gap-2">
            <TicketIcon className="w-6 h-6 text-primary" />
            Détails de ta commande
          </CardTitle>
          <CardDescription className="text-base">
            Commande N° {orderId}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8 flex flex-col gap-6 text-left">
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between border-b border-border/50 pb-4">
              <span className="text-muted-foreground">Événement</span>
              <span className="font-bold text-right">{event.title}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-4">
              <span className="text-muted-foreground">Date et Heure</span>
              <span className="font-semibold text-right">
                {new Date(event.event_date).toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-4">
              <span className="text-muted-foreground">Lieu</span>
              <span className="font-semibold text-right">{event.venue_name}, {event.venue_city}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total payé</span>
              <span>{Number(orderData.total_paid).toFixed(2)} MAD</span>
            </div>
          </div>
          
          <div className="bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 p-4 rounded-xl flex items-start gap-3 mt-4">
            <FileTextIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">
              Ton ticket a été envoyé à ton email. Présente-le le jour de l&apos;événement sur ton téléphone pour accéder à la salle.
            </p>
          </div>

        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-sm">
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full h-12 rounded-xl text-lg font-semibold py-6">
            Retour à l&apos;accueil
          </Button>
        </Link>
        <Button className="w-full h-12 rounded-xl text-lg font-bold py-6 shadow-md hover:shadow-lg transition-all gap-2">
          <DownloadIcon className="w-5 h-5" />
          Télécharger le PDF
        </Button>
      </div>

    </main>
  );
}