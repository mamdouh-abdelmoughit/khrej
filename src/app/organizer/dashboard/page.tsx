import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, TicketIcon, UsersIcon, BanknoteIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "@/utils/supabase/server";
import { protectOrganizerRoute } from "@/lib/auth";

async function getOrganizerDashboardData(userId: string) {
  const supabase = createClient();
  
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, event_date, tickets_sold, ticket_quantity, ticket_price, status")
    .eq("organizer_id", userId)
    .order("created_at", { ascending: false });

  if (error || !events) {
    return {
      totalRevenue: 0,
      totalTicketsSold: 0,
      events: []
    }
  }

  // Ideally, revenue should come from orders.total_paid.
  // Since we fetch by organizer_id, let's just make a subquery or calculate here.
  let totalRevenue = 0;
  for(const ev of events){
    // Mocking revenue as tickets_sold * ticket_price instead of a separate query to keep it fast MVP
    // We can also fetch the orders if strict accuracy is required.
    totalRevenue += (ev.tickets_sold * ev.ticket_price);
  }

  const totalTicketsSold = events.reduce((acc, ev) => acc + ev.tickets_sold, 0);

  return {
    totalRevenue,
    totalTicketsSold,
    events
  };
}

export default async function OrganizerDashboard() {
  const user = await protectOrganizerRoute();
  const data = await getOrganizerDashboardData(user.id);

  return (
    <main className="container mx-auto px-4 max-w-screen-xl py-12 flex flex-col gap-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue, voici un résumé de vos événements actuels.</p>
        </div>
        <Link href="/organizer/events/new">
          <Button className="rounded-xl h-12 px-6 shadow-md transition-all">
            <PlusIcon className="w-5 h-5 mr-2" />
            Créer un événement
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus (MAD)</CardTitle>
            <BanknoteIcon className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% depuis le mois dernier</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Billets Vendus</CardTitle>
            <TicketIcon className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur tous vos événements actifs</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Événements Actifs</CardTitle>
            <UsersIcon className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.events.filter(e => e.status === "published").length}</div>
            <p className="text-xs text-muted-foreground mt-1">Événements en cours de vente</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Table */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Vos Événements</h2>
        <div className="rounded-2xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Ventes</TableHead>
                <TableHead className="text-right">Revenus (MAD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun événement trouvé. Créez votre premier événement !
                  </TableCell>
                </TableRow>
              ) : (
                data.events.map((event) => (
                  <TableRow key={event.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <Link href={`/organizer/events/${event.id}`} className="hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {format(new Date(event.event_date), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {event.status === "published" ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200 shadow-none">Publié</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground bg-muted shadow-none">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {event.tickets_sold} / {event.ticket_quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(event.tickets_sold * event.ticket_price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(event.tickets_sold * event.ticket_price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}