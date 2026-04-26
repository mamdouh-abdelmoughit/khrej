import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MyTicketsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, buyer_name, buyer_email, quantity, total_paid, created_at, event_id")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Mes tickets</h1>
      <p className="text-muted-foreground mt-1">Retrouvez ici vos réservations.</p>

      <div className="mt-6 grid gap-4">
        {orders && orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order.id} className="rounded-xl border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Commande #{order.id.slice(0, 8)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Nom: {order.buyer_name}</p>
                <p>Email: {order.buyer_email}</p>
                <p>Quantité: {order.quantity}</p>
                <p>Total payé: {Number(order.total_paid).toFixed(2)} MAD</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="rounded-xl border-dashed border-border/70">
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">Vous n&apos;avez pas encore de tickets.</p>
              <Link href="/" className="inline-block mt-4">
                <Button>Explorer les événements</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
