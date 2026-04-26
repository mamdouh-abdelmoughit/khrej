"use server";

import { createClient } from "@/utils/supabase/server";
import { Resend } from "resend";
import QRCode from "qrcode";

export async function processCheckoutAction(eventId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    throw new Error("L'événement n'existe pas.");
  }

  if (event.tickets_sold >= event.ticket_quantity) {
    throw new Error("Événement complet.");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  const fullName = `${firstName} ${lastName}`;
  const platformFee = event.ticket_price * 0.05;
  const totalPrice = event.ticket_price + platformFee;

  // We should ideally use an RPC or do optimistic updates.
  // For the MVP, we just do a traditional update and rely on RLS.
  const { error: updateError } = await supabase
    .from("events")
    .update({ tickets_sold: event.tickets_sold + 1 })
    .eq("id", event.id);

  if (updateError) {
    throw new Error("Impossible de réserver un ticket. Veuillez réessayer.");
  }

  const qrCodeText = crypto.randomUUID();
  const qrCodeImage = await QRCode.toDataURL(qrCodeText);

  const { data: order, error: orderError } = await supabase.from("orders").insert({
    event_id: event.id,
    buyer_id: user ? user.id : null,
    buyer_email: email,
    buyer_name: fullName,
    buyer_phone: phone,
    quantity: 1,
    unit_price: event.ticket_price,
    platform_fee: platformFee,
    total_paid: totalPrice,
    status: "paid", // MVP bypass
    qr_code: qrCodeText,
  }).select("id").single();

  if (orderError || !order) {
    // Basic rollback for MVP (just in case order fails after ticket update)
    await supabase.from("events").update({ tickets_sold: event.tickets_sold }).eq("id", event.id);
    throw new Error("Erreur de création de commande.");
  }

  // Resend email code
  const resend = new Resend(process.env.RESEND_API_KEY || "re_mock");
  
  if (process.env.RESEND_API_KEY) {
    await resend.emails.send({
      from: "Khrej <tickets@khrej.com>", // Make sure to verify this domain on Resend
      to: email,
      subject: `Ton ticket Khrej — ${event.title}`,
      html: `
        <h1>Mhjouz ! 🎉</h1>
        <p>Salut ${firstName},</p>
        <p>Ta place pour <strong>${event.title}</strong> est confirmée.</p>
        <ul>
          <li><strong>Date:</strong> ${new Date(event.event_date).toLocaleString('fr-FR')}</li>
          <li><strong>Lieu:</strong> ${event.venue_name}, ${event.venue_city}</li>
        </ul>
        <p>Présente ce QR Code à l'entrée :</p>
        <img src="${qrCodeImage}" alt="Ticket QR Code" style="width: 250px; height: 250px;" />
        <p>À bientôt,<br>L'équipe Khrej</p>
      `,
    });
  }

  return { orderId: order.id, success: true };
}