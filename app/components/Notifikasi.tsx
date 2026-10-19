"use client";

import {
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getIplSummary } from "../lib/iplSummary";
import { supabase } from "../lib/supabase";

type WargaRingkas = {
  nama: string;
  no_hp: string | null;
};

type RumahRingkas = {
  blok: string;
  no_rumah: string;
  warga: WargaRingkas | WargaRingkas[] | null;
};

type TagihanNotifikasi = {
  id: string;
  bulan: string;
  tahun: number;
  nominal: number;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
  metode_pembayaran: string | null;
  rumah: RumahRingkas | null;
};

const DETAIL_SELECT = `
  id,
  bulan,
  tahun,
  nominal,
  status,
  created_at,
  updated_at,
  updated_by,
  metode_pembayaran,
  rumah:rumah_id (
    blok,
    no_rumah,
    warga (
      nama,
      no_hp
    )
  )
`;

function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatTanggal(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getWarga(rumah: RumahRingkas | null) {
  if (!rumah?.warga) return null;

  return Array.isArray(rumah.warga) ? (rumah.warga[0] ?? null) : rumah.warga;
}

export default function Notifikasi() {
  const [tunggakanList, setTunggakanList] = useState<TagihanNotifikasi[]>([]);
  const [pembayaranTerbaru, setPembayaranTerbaru] = useState<
    TagihanNotifikasi[]
  >([]);
  const [summary, setSummary] = useState({
    totalTunggakan: 0,
    totalTunggakanCount: 0,
    totalLunas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function getDataNotifikasi() {
    try {
      // Ringkasan memakai helper ringan (tanpa join).
      // Detail dibatasi: 10 tunggakan tertua + 5 pembayaran terbaru.
      const [iplSummary, tunggakanRes, pembayaranRes] = await Promise.all([
        getIplSummary(),

        supabase
          .from("tagihan_ipl")
          .select(DETAIL_SELECT)
          .not("status", "ilike", "lunas")
          .order("tahun", { ascending: true })
          .order("created_at", { ascending: true })
          .limit(10),

        supabase
          .from("tagihan_ipl")
          .select(DETAIL_SELECT)
          .ilike("status", "lunas")
          .order("updated_at", { ascending: false })
          .limit(5),
      ]);

      if (tunggakanRes.error) throw tunggakanRes.error;
      if (pembayaranRes.error) throw pembayaranRes.error;

      setSummary({
        totalTunggakan: iplSummary.totalTunggakan,
        totalTunggakanCount: iplSummary.belumCount,
        totalLunas: iplSummary.lunasCount,
      });

      setTunggakanList(
        (tunggakanRes.data as unknown as TagihanNotifikasi[]) ?? [],
      );

      setPembayaranTerbaru(
        (pembayaranRes.data as unknown as TagihanNotifikasi[]) ?? [],
      );

      setFetchError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat notifikasi";

      setFetchError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    // Fetch data awal setelah komponen terpasang.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getDataNotifikasi();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await getDataNotifikasi();
  }

  function handleRetry() {
    setFetchError(null);
    setLoading(true);
    getDataNotifikasi();
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-red-600">{fetchError}</p>

        <button
          onClick={handleRetry}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 space-y-6 md:px-0">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifikasi</h1>

          <p className="mt-1 text-gray-500">
            Tunggakan dan pembayaran IPL terbaru
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Memuat..." : "Muat ulang"}
        </button>
      </div>

      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-yellow-600">
            <TriangleAlert size={18} />

            <p className="text-sm font-medium">Tunggakan</p>
          </div>

          <p className="mt-3 text-3xl font-bold text-gray-900">
            {summary.totalTunggakanCount}
          </p>

          <p className="mt-1 text-sm text-gray-500">tagihan belum dibayar</p>
        </div>

        <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center gap-2 text-yellow-700">
            <Wallet size={18} />

            <p className="text-sm font-medium">Total Tunggakan</p>
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {formatRupiah(summary.totalTunggakan)}
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            dari {summary.totalTunggakanCount} tagihan
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />

            <p className="text-sm font-medium">Pembayaran Lunas</p>
          </div>

          <p className="mt-3 text-3xl font-bold text-gray-900">
            {summary.totalLunas}
          </p>

          <p className="mt-1 text-sm text-gray-500">tagihan sudah dibayar</p>
        </div>
      </div>

      {/* DAFTAR TUNGGAKAN */}
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Daftar Tunggakan
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Menampilkan {tunggakanList.length} dari{" "}
              {summary.totalTunggakanCount} tunggakan, diurutkan dari periode
              paling lama
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
            {summary.totalTunggakanCount} tagihan
          </span>
        </div>

        {summary.totalTunggakanCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
            <CheckCircle2 className="mx-auto text-green-500" size={28} />

            <p className="mt-2 text-sm font-medium text-gray-700">
              Tidak ada tunggakan
            </p>

            <p className="text-xs text-gray-500">
              Semua tagihan IPL sudah lunas.
            </p>
          </div>
        ) : (
          <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
            {tunggakanList.map((item) => {
              const warga = getWarga(item.rumah);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-yellow-200 bg-yellow-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">
                        Belum Bayar
                      </p>

                      <h3 className="mt-1 truncate font-bold text-gray-900">
                        {item.rumah?.blok ?? "-"}/
                        {item.rumah?.no_rumah ?? "-"} ·{" "}
                        {warga?.nama ?? "Tanpa penghuni"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        Periode {item.bulan} {item.tahun}
                      </p>

                      {warga?.no_hp && (
                        <p className="mt-1 text-xs text-gray-500">
                          No HP: {warga.no_hp}
                        </p>
                      )}
                    </div>

                    <p className="shrink-0 font-bold text-gray-900">
                      {formatRupiah(item.nominal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PEMBAYARAN TERBARU */}
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Pembayaran Terbaru
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            5 pembayaran lunas terakhir
          </p>
        </div>

        {pembayaranTerbaru.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
            <Wallet className="mx-auto text-gray-400" size={28} />

            <p className="mt-2 text-sm font-medium text-gray-700">
              Belum ada pembayaran
            </p>

            <p className="text-xs text-gray-500">
              Pembayaran yang dicatat akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pembayaranTerbaru.map((item) => {
              const warga = getWarga(item.rumah);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-green-200 bg-green-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                        Lunas
                      </p>

                      <h3 className="mt-1 truncate font-bold text-gray-900">
                        {item.rumah?.blok ?? "-"}/
                        {item.rumah?.no_rumah ?? "-"} ·{" "}
                        {warga?.nama ?? "Tanpa penghuni"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        Periode {item.bulan} {item.tahun}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Dibayar{" "}
                        {formatTanggal(item.updated_at ?? item.created_at)}
                        {item.metode_pembayaran
                          ? ` · ${
                              item.metode_pembayaran === "transfer"
                                ? "Transfer"
                                : "Cash"
                            }`
                          : ""}
                      </p>
                    </div>

                    <p className="shrink-0 font-bold text-gray-900">
                      {formatRupiah(item.nominal)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
