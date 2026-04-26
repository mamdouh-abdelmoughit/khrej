"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createEventAction(formData: FormData) {
  console.log("[createEventAction] start");
  const supabase = createClient();

  console.log("[createEventAction] fetching auth user");
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[createEventAction] auth lookup failed", { authError, user });
    throw new Error("Vous devez etre connecte");
  }

  const organizerId = user.id;
  console.log("[createEventAction] auth user found", { organizerId });

  console.log("[createEventAction] checking profile role for organizer");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_verified")
    .eq("id", organizerId)
    .single();

  if (profileError || !profile || profile.role !== "organizer") {
    console.error("[createEventAction] organizer role check failed", { profileError, profile, organizerId });
    throw new Error("Acces refuse. Vous devez etre organisateur.");
  }

  if (!profile.is_verified) {
    console.error("[createEventAction] organizer account not verified", { organizerId, profile });
    throw new Error("Compte en cours de verification. Merci de patienter jusqu'a validation.");
  }
  console.log("[createEventAction] profile validated as organizer");

  console.log("[createEventAction] parsing form data");
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
    console.log("[createEventAction] checking storage bucket", { bucket: "event-covers" });
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket("event-covers");

    if (bucketError || !bucket) {
      console.error("[createEventAction] bucket lookup failed", { bucketError, bucket });
      throw new Error("Bucket 'event-covers' introuvable. Créez-le dans Supabase Storage.");
    }

    if (!bucket.public) {
      console.error("[createEventAction] bucket is not public", { bucket });
      throw new Error("Le bucket 'event-covers' doit être public pour exposer les images.");
    }

    const uploadPath = `${crypto.randomUUID()}-${cover_image.name}`;
    console.log("[createEventAction] uploading cover image", {
      uploadPath,
      fileType: cover_image.type,
      fileSize: cover_image.size,
    });

    const { error: uploadError } = await supabase.storage
      .from("event-covers")
      .upload(uploadPath, cover_image);

    if (uploadError) {
      console.error("[createEventAction] storage upload failed", {
        uploadError,
        uploadPath,
        message: uploadError.message,
        name: uploadError.name,
      });
      throw new Error("Erreur lors de l'upload de l'image : " + uploadError.message);
    }

    console.log("[createEventAction] upload succeeded, generating public URL", { uploadPath });
    const { data: { publicUrl } } = supabase.storage
      .from("event-covers")
      .getPublicUrl(uploadPath);

    cover_image_url = publicUrl;
    console.log("[createEventAction] cover image URL ready", { cover_image_url });
  } else {
    console.log("[createEventAction] no cover image provided or empty file");
  }

  console.log("[createEventAction] inserting event", {
    organizerId,
    title,
    venue_city,
    event_date,
    ticket_price,
    ticket_quantity,
    hasCoverImage: Boolean(cover_image_url),
  });
  const { error: insertError } = await supabase.from("events").insert({
    organizer_id: organizerId,
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
    console.error("[createEventAction] database insert failed", { insertError, organizerId });
    throw new Error("Erreur lors de la creation de l'evenement : " + insertError.message);
  }
  console.log("[createEventAction] event created successfully");

  console.log("[createEventAction] revalidating caches");
  revalidatePath("/");
  revalidatePath("/organizer/dashboard");
  console.log("[createEventAction] redirecting to organizer dashboard");
  redirect("/organizer/dashboard");
}