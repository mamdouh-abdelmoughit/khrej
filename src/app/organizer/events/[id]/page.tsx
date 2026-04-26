import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, TicketIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { protectOrganizerRoute } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function getEventDetails(userId: string, eventId: string) {
  const supabase = createClient();
  
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event || event.organizer_id !== userId) {
    return null;
  }

  const { data: attendees, error: attendeesError } = await supabase
    .from("orders")
    .select("id, buyer_name, buyer_email, buyer_phone, status, qr_code")
    .eq("event_id", eventId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  return {
    ...event,
    attendees: attendees || [],
  };
}

export default async function OrganizerEventDetails({ params }: { params: { id: string } }) {
  const user = await protectOrganizerRoute();
  const event = await getEventDetails(user.id, params.id);

  if (!event) {
    return (
      <main className="container mx-auto px-4 max-w-screen-xl py-12 flex flex-col gap-8">
        <h1 className="text-2xl font-bold">Événement introuvable ou accès non autorisé</h1>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 max-w-screen-xl py-12 flex flex-col gap-8">
      
      <div className="flex flex-col gap-2">
        <Link href="/organizer/dashboard" className="text-sm flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeftIcon className="w-4 h-4 mr-2" /> Retour au tableau de bord
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">
              {format(new Date(event.event_date), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {event.status === "published" ? (
              <Badge className="bg-green-500 hover:bg-green-600">Publié</Badge>
            ) : (
              <Badge variant="secondary">Brouillon</Badge>
            )}
            <Button variant="outline">Modifier l&apos;événement</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Billets Vendus</CardTitle>
            <TicketIcon className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{event.tickets_sold} <span className="text-xl text-muted-foreground font-medium">/ {event.ticket_quantity}</span></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus (MAD)</CardTitle>
            <UsersIcon className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(event.tickets_sold * event.ticket_price).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-4">Liste des participants ({event.attendees.length})</h2>
      <Card className="rounded-2xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.attendees.map((attendee: any) => (
                <TableRow key={attendee.id}>
                  <TableCell className="font-medium">{attendee.buyer_name}</TableCell>
                  <TableCell>{attendee.buyer_email}</TableCell>
                  <TableCell>{attendee.buyer_phone || "N/A"}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{attendee.qr_code.substring(0, 8)}...</TableCell>
                  <TableCell className="text-right">
                    {attendee.status === "scanned" ? (
                      <Badge variant="destructive" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-green-200">
                        Scanné
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 shadow-none border-orange-200">
                        Valide
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {event.attendees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Aucun billet vendu pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}