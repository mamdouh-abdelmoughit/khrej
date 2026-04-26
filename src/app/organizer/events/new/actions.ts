"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createEventAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Vous devez être connecté");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "organizer") {
    throw new Error("Accès refusé");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const venue_name = formData.get("venue_name") as string;
  const venue_city = formData.get("venue_city") as string;
  const event_date = formData.get("event_date") as string;
  const ticket_price = parseFloat(formData.get("ticket_price") as string);
  const ticket_quantity = parseInt(formData.get("ticket_quantity") as string, 10);
  const cover_image = formData.get("cover_image") as File;

  let cover_image_url = "";

  if (cover_image && cover_image.size > 0) {
    const fileExt = cover_image.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("event-covers")
      .upload(filePath, cover_image);

    if (uploadError) {
      console.error(uploadError);
      throw new Error("Erreur lors de l'upload de l'image.");
    }

    const { data: { publicUrl } } = supabase.storage
      .from("event-covers")
      .getPublicUrl(filePath);

    cover_image_url = publicUrl;
  }

  const { error: insertError } = await supabase.from("events").insert({
    organizer_id: user.id,
    title,
    description,
    venue_name,
    venue_city,
    event_date: new Date(event_date).toISOString(),
    ticket_price,
    ticket_quantity,
    tickets_sold: 0,
    status: "published",
    cover_image_url,
  });

  if (insertError) {
    console.error(insertError);
    throw new Error("Erreur lors de la création de l'évènement.");
  }

  revalidatePath("/");
  revalidatePath("/organizer/dashboard");
  redirect("/organizer/dashboard");
}