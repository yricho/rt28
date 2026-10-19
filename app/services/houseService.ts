import { supabase } from "@/app/lib/supabase";
import { House } from "@/app/types/house";

export async function getHouses(): Promise<House[]> {
  const { data, error } = await supabase
    .from("rumah")
    .select(
      `
      id,
      no_rumah,
      blok,
      alamat,
      latitude,
      longitude,
      status,
      warga (
        id,
        nama,
        no_hp
      )
    `,
    )
    .order("blok");

  if (error) throw error;

  return (data as unknown as House[]) ?? [];
}