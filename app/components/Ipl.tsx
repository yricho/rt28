"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";
import DetailIpl from "./detailipl";

const PAGE_SIZE = 10;

type TagihanIPL = {
  id: number;
  bulan: string;
  tahun: number;
  nominal: number;
  status: "lunas" | "belum_bayar";
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  rumah: {
    id: number;
    no_rumah: string;
    blok: string;
    warga: { nama: string; no_hp: string } | null;
  } | null;
};

export default function IPLPage() {
  const [ipl, setIPL] = useState<TagihanIPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const [openModalDetail, setOpenModalDetail] = useState(false);
  const [selectedIpl, setSelectedIpl] = useState<TagihanIPL | null>(null);

  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterBlok, setFilterBlok] = useState("");

  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    bulan: "",
    tahun: new Date().getFullYear(),
    nominal: 0,
  });

  // =========================
  // GET DATA IPL
  // =========================
  async function getDataIPL() {
    setLoading(true);
    setFetchError(null);

    try {
      const { data, error } = await supabase
        .from("tagihan_ipl")
        .select(
          `
    id,
    bulan,
    tahun,
    nominal,
    status,
    created_by,
    created_at,
    updated_at,
    updated_by,
    rumah:rumah_id!inner (
      id,
      no_rumah,
      blok,
      status,
      warga (
        nama,
        no_hp
      )
    )
  `,
        )
        .eq("rumah.status", "active")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      setIPL((data as unknown as TagihanIPL[]) || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat data IPL";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDataIPL();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterBulan, filterBlok]);

  // =========================
  // FILTER DATA
  // =========================
  const filteredIPL = useMemo(() => {
    return ipl.filter((item) => {
      const nama = item.rumah?.warga?.nama ?? "";
      const matchSearch = nama.toLowerCase().includes(search.toLowerCase());
      const matchBulan = filterBulan
        ? item.bulan.toLowerCase() === filterBulan.toLowerCase()
        : true;
      const matchBlok = filterBlok ? item.rumah?.blok === filterBlok : true;
      return matchSearch && matchBulan && matchBlok;
    });
  }, [ipl, search, filterBulan, filterBlok]);

  const totalPages = Math.ceil(filteredIPL.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredIPL.slice(start, start + PAGE_SIZE);
  }, [filteredIPL, page]);

  const sortedIPL = [...filteredIPL].sort((a, b) =>
    (a.rumah?.warga?.nama || "").localeCompare(
      b.rumah?.warga?.nama || "",
      "id",
      {
        sensitivity: "base",
      },
    ),
  );

  function exportExcel() {
    if (filteredIPL.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }

    const totalLunas = filteredIPL
      .filter((item) => item.status?.toLowerCase() === "lunas")
      .reduce((total, item) => total + Number(item.nominal || 0), 0);

    const totalBelumBayar = filteredIPL
      .filter((item) => item.status?.toLowerCase() !== "lunas")
      .reduce((total, item) => total + Number(item.nominal || 0), 0);

    const totalTagihan = filteredIPL.reduce(
      (total, item) => total + Number(item.nominal || 0),
      0,
    );

    const rows = [
      ["RINGKASAN IPL"],
      [],
      ["Total Tagihan", totalTagihan],
      ["Total Sudah Dibayar", totalLunas],
      ["Total Belum Dibayar", totalBelumBayar],
      [],
      [
        "No",
        "Nama Warga",
        "Blok",
        "No Rumah",
        "Periode",
        "Nominal",
        "Status",
        "Updated At",
        "Updated By",
      ],
      ...sortedIPL.map((item, index) => [
        index + 1,
        item.rumah?.warga?.nama?.toUpperCase() ?? "-",
        item.rumah?.blok ?? "-",
        item.rumah?.no_rumah ?? "-",
        `${item.bulan} ${item.tahun}`,
        item.nominal,
        item.status === "lunas" ? "LUNAS" : "BELUM BAYAR",
        new Date(item.updated_at).toLocaleString("id-ID"),
        item.updated_by ?? "-",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data IPL");

    XLSX.writeFile(
      workbook,
      `data-ipl-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  }

  // =========================
  // GENERATE IPL
  // =========================
  async function handleGenerate() {
    if (!form.bulan || !form.nominal) {
      toast.error("Bulan & nominal wajib diisi");
      return;
    }

    setActionLoading(true);

    try {
      const { data: rumah, error: rumahError } = await supabase
        .from("rumah")
        .select("id");

      if (rumahError) throw new Error(rumahError.message);
      if (!rumah || rumah.length === 0) throw new Error("Tidak ada data rumah");

      const tagihan = rumah.map((r) => ({
        rumah_id: r.id,
        bulan: form.bulan,
        tahun: form.tahun,
        nominal: form.nominal,
        status: "belum_bayar",
        created_by: "Admin",
        updated_by: "Admin",
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("tagihan_ipl")
        .insert(tagihan);

      if (insertError) throw new Error(insertError.message);

      setOpenModal(false);
      setForm({ bulan: "", tahun: new Date().getFullYear(), nominal: 0 });
      await getDataIPL();
      toast.success("IPL berhasil digenerate");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal generate IPL";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  // =========================
  // BAYAR IPL
  // =========================
  async function bayarIpl(
    id: number,
    wargaNama: string = "",
    blok: string = "",
    noRumah: string = "",
  ) {
    const wargaDisplayName = wargaNama
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const confirmed = window.confirm(
      `Konfirmasi pembayaran IPL untuk ${wargaDisplayName} (${blok}/${noRumah})?`,
    );
    if (!confirmed) return;

    setActionLoading(true);

    try {
      const { error } = await supabase
        .from("tagihan_ipl")
        .update({
          status: "lunas",
          updated_by: "Apri",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw new Error(error.message);

      await getDataIPL();
      toast.success(`Pembayaran ${wargaDisplayName} berhasil dicatat`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal memproses pembayaran";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  }

  const BULAN_OPTIONS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading IPL...
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-red-500">{fetchError}</p>
        <button
          onClick={getDataIPL}
          className="px-4 py-2 bg-black text-white rounded-xl text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Data IPL</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tagihan iuran lingkungan warga
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportExcel}
              className="h-12 rounded-xl bg-green-600 text-white font-medium shadow-sm active:scale-95 transition"
            >
              Export Excel
            </button>
            <button
              onClick={() => setOpenModal(true)}
              className="h-12 rounded-xl bg-black text-white font-medium shadow-sm active:scale-95 transition"
            >
              + Generate IPL
            </button>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-3xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">Filter Data</h2>
            <p className="text-sm text-gray-500">
              Cari tagihan berdasarkan nama, blok atau periode
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama warga..."
              className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <input
              type="text"
              value={filterBlok}
              onChange={(e) => setFilterBlok(e.target.value.toUpperCase())}
              placeholder="Blok"
              className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full h-12 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Semua Bulan</option>
              {BULAN_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearch("");
                setFilterBulan("");
                setFilterBlok("");
              }}
              className="h-12 rounded-xl border border-gray-200 font-medium hover:bg-gray-50 transition"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* MOBILE CARD */}
        <div className="md:hidden space-y-3">
          {paginatedData.length === 0 && (
            <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
              Tidak ada data IPL
            </div>
          )}
          {paginatedData.map((item) => {
            const isLunas = item.status === "lunas";
            return (
              <div
                key={item.id}
                className={`relative bg-white border rounded-2xl p-4 overflow-hidden transition-shadow hover:shadow-md ${
                  isLunas ? "border-green-100" : "border-gray-200"
                }`}
              >
                {/* Accent strip kiri */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                    isLunas ? "bg-green-400" : "bg-yellow-400"
                  }`}
                />

                <div className="pl-3">
                  {/* HEADER */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Blok
                        </span>
                        <span className="font-bold text-base text-gray-900">
                          {item.rumah?.blok}/{item.rumah?.no_rumah}
                        </span>
                      </div>
                      <div
                        className="h-0.5 w-full bg-gray-100 my-1"
                        onClick={() => {
                          setSelectedIpl(item);
                          setOpenModalDetail(true);
                        }}
                      >
                        {item.rumah?.warga?.nama ?? "-"}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                        isLunas
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                      }`}
                    >
                      {isLunas ? "✓ Lunas" : "Belum Bayar"}
                    </span>
                  </div>

                  {/* DIVIDER */}
                  <div className="border-t border-gray-100 my-3" />

                  {/* NOMINAL & PERIODE */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Periode</p>
                      <p className="text-sm font-medium text-gray-700">
                        {item.bulan} {item.tahun}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">Nominal</p>
                      <p className="text-base font-bold text-gray-900">
                        Rp {Number(item.nominal).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* BUTTON */}
                  {!isLunas && (
                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        bayarIpl(
                          item.id,
                          item.rumah?.warga?.nama,
                          item.rumah?.blok,
                          item.rumah?.no_rumah,
                        )
                      }
                      className="mt-4 h-10 w-full rounded-xl bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      Bayar IPL
                    </button>
                  )}

                  {isLunas && (
                    <div className="mt-4 h-10 w-full rounded-xl bg-green-50 flex items-center justify-center gap-1.5 text-green-600 text-sm font-black capitalize">
                      <span>✓</span>
                      <span>Ditagih oleh: {item.updated_by}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="hidden md:block bg-white border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">No.Rumah / Nama</th>
                  <th className="px-4 py-3 text-left">Periode</th>
                  <th className="px-4 py-3 text-left">Nominal</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-500">
                      Tidak ada data IPL
                    </td>
                  </tr>
                )}
                {paginatedData.map((item) => {
                  const isLunas = item.status === "lunas";
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3 font-medium capitalize flex items-center gap-2">
                        <span className="font-black">
                          {item.rumah?.blok}/{item.rumah?.no_rumah}
                        </span>
                        <span>•</span>
                        <span>{item.rumah?.warga?.nama}</span>
                      </td>
                      <td className="px-4 py-3">
                        {item.bulan} {item.tahun}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        Rp {Number(item.nominal).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!isLunas ? (
                          <button
                            disabled={actionLoading}
                            onClick={() =>
                              bayarIpl(
                                item.id,
                                item.rumah?.warga?.nama,
                                item.rumah?.blok,
                                item.rumah?.no_rumah,
                              )
                            }
                            className="bg-yellow-700 text-white px-3 py-1 rounded-lg text-xs disabled:opacity-50"
                          >
                            Bayar
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            LUNAS
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-5">
            <p className="text-sm text-gray-500">
              Menampilkan {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredIPL.length)} dari{" "}
              {filteredIPL.length} data
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <div className="px-4 py-2 text-sm font-medium">
                {page} / {totalPages}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* MODAL GENERATE */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Generate IPL</h2>

              <select
                value={form.bulan}
                onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                className="w-full border px-3 py-2 rounded-xl mb-3"
              >
                <option value="">Pilih Bulan</option>
                {BULAN_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Tahun"
                value={form.tahun}
                onChange={(e) =>
                  setForm({ ...form, tahun: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded-xl mb-3"
              />

              <input
                type="number"
                placeholder="Nominal"
                value={form.nominal || ""}
                onChange={(e) =>
                  setForm({ ...form, nominal: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded-xl mb-4"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setOpenModal(false)}
                  className="flex-1 border py-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  disabled={actionLoading}
                  onClick={handleGenerate}
                  className="flex-1 bg-black text-white py-2 rounded-xl disabled:opacity-50"
                >
                  {actionLoading ? "Loading..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETAIL */}

        {openModalDetail && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setOpenModalDetail(false)}
                className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
              >
                <X size={18} />
              </button>

              {/* CONTENT */}
              <div className="max-h-[90vh] overflow-y-auto">
                <DetailIpl data={selectedIpl} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
