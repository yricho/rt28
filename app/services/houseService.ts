import { supabase } from "@/app/lib/supabase";

export async function getHouses() {
  const { data, error } = await supabase
    .from("rumah")
    .select(
      `
      *,
      warga(
        id,
        nama,
        no_hp
      )
    `
    )
    .order("blok");

  if (error) throw error;

  return data;
}