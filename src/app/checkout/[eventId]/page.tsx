import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage({ params }: { params: { eventId: string } }) {
  const supabase = createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.eventId)
    .single();

  if (error || !event) {
    notFound();
  }

  const platformFee = event.ticket_price * 0.05;
  const totalPrice = event.ticket_price + platformFee;

  return (
    <main className="container mx-auto px-4 max-w-screen-xl py-8 md:py-12">
      <Suspense fallback={<div>Chargement...</div>}>
        <CheckoutForm event={event} platformFee={platformFee} totalPrice={totalPrice} />
      </Suspense>
    </main>
  );
}