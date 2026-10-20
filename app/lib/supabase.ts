import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Konfigurasi Supabase belum lengkap. Set NEXT_PUBLIC_SUPABASE_URL dan " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY, termasuk pada environment build/deploy.",
    );
  }

  client = createClient(url, anonKey);

  return client;
}

/**
 * Client dibuat secara lazy saat pertama kali dipakai, bukan saat module
 * di-import. Dengan begitu `next build` tidak gagal ketika halaman
 * di-prerender di environment yang belum memiliki env variable Supabase.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const instance = getSupabaseClient();
    const value = Reflect.get(instance, prop, instance);

    return typeof value === "function" ? value.bind(instance) : value;
  },
  set(_target, prop, value) {
    return Reflect.set(getSupabaseClient(), prop, value);
  },
});
