import { supabase } from "./supabase";

const PAGE_SIZE = 1000;

type SummaryRow = {
  nominal: number | null;
  status: string | null;
};

export type IplSummary = {
  totalTagihan: number;
  totalLunas: number;
  totalTunggakan: number;
  lunasCount: number;
  belumCount: number;
};

/**
 * Mengambil ringkasan seluruh tagihan IPL.
 *
 * Hanya kolom nominal & status yang diambil (tanpa join) dan dibaca bertahap
 * karena PostgREST membatasi jumlah baris per request (default 1000).
 */
export async function getIplSummary(): Promise<IplSummary> {
  const rows: SummaryRow[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("tagihan_ipl")
      .select("nominal, status")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    const batch = (data ?? []) as SummaryRow[];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
  }

  let totalLunas = 0;
  let totalTunggakan = 0;
  let lunasCount = 0;
  let belumCount = 0;

  for (const row of rows) {
    const nominal = Number(row.nominal || 0);

    if (row.status?.toLowerCase() === "lunas") {
      totalLunas += nominal;
      lunasCount += 1;
    } else {
      totalTunggakan += nominal;
      belumCount += 1;
    }
  }

  return {
    totalTagihan: rows.length,
    totalLunas,
    totalTunggakan,
    lunasCount,
    belumCount,
  };
}
