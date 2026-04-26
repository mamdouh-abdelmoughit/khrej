"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { processCheckoutAction } from "./actions";

export default function CheckoutForm({ event, platformFee, totalPrice }: { event: any, platformFee: number, totalPrice: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      const res = await processCheckoutAction(event.id, formData);
      if (res.success) {
        router.push(`/confirmation?orderId=${res.orderId}&eventId=${event.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <>
      <Link href={`/events/${event.id}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeftIcon className="w-4 h-4 mr-2" /> Retour à l&apos;événement
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        <div className="md:col-span-1 md:order-2">
          <Card className="sticky top-24 border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{event.title}</span>
                <span className="text-sm text-muted-foreground">1x Ticket d&apos;entrée</span>
              </div>
              <div className="h-px w-full bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix du ticket</span>
                <span>{event.ticket_price.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frais de plateforme (5%)</span>
                <span>{platformFee.toFixed(2)} MAD</span>
              </div>
              <div className="h-px w-full bg-border" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{totalPrice.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 md:order-1">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Tes informations</CardTitle>
              <CardDescription>
                Ces informations seront utilisées pour t&apos;envoyer ton ticket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" name="firstName" required placeholder="Adam" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" name="lastName" required placeholder="El Fassi" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="adam@example.com" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="+212 6 00 00 00 00" />
                </div>

                {error && (
                  <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 text-center">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full mt-4 h-14 rounded-xl text-lg font-bold shadow-md" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Payer maintenant — ${totalPrice.toFixed(2)} MAD`
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground text-balance">
                  Paiement 100% sécurisé. Tes données sont cryptées.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </>
  );
}