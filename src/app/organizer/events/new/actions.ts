"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createEventAction(formData: FormData) {
  console.log("-> Starting createEventAction");
  const supabase = createClient();
  
  console.log("-> Calling auth.getUser()");
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth Error or no user:", authError);
    throw new Error("Vous devez etre connecte");
  }
  console.log("-> User found:", user.id);

  console.log("-> Fetching profile");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "organizer") {
    console.error("Profile Error or not organizer:", profileError, profile);
    throw new Error("Acces refuse. Vous devez etre organisateur.");
  }
  console.log("-> Profile validated as organizer");

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
    console.log("-> Starting cover image upload");
    const fileName = crypto.randomUUID() + "-" + cover_image.name;
    const filePath = user.id + "/" + fileName;

    console.log("-> Uploading to path:", filePath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("event-covers")
      .upload(filePath, cover_image);

    if (uploadError) {
      console.error("Storage upload error details:", uploadError);
      throw new Error("Erreur lors de l'upload de l'image : " + uploadError.message);
    }

    console.log("-> Upload successful, getting public URL");
    const { data: { publicUrl } } = supabase.storage
      .from("event-covers")
      .getPublicUrl(uploadData.path);

    cover_image_url = publicUrl;
    console.log("-> Public URL:", cover_image_url);
  } else {
    console.log("-> No cover image provided or size is 0");
  }

  console.log("-> Inserting event into database");
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
    console.error("Database insert error details:", insertError);
    throw new Error("Erreur lors de la creation de l'evenement : " + insertError.message);
  }
  console.log("-> Event created successfully");

  revalidatePath("/");
  revalidatePath("/organizer/dashboard");
  redirect("/organizer/dashboard");
}