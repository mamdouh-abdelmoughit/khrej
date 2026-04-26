import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/server";
import { EventList } from "@/components/EventList";

export default async function Home() {
  const supabase = createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true });

  const eventsList = events || [];

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-screen-xl flex flex-col items-center text-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl text-balance">
            Découvre les meilleurs événements au Maroc
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
            Concerts, stand-up, sport, festivals — achète ton ticket en 1 minute
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 max-w-screen-xl">
        <EventList initialEvents={eventsList} />
      </section>
    </div>
  );
}
