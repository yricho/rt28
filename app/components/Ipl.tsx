"use client";

import { LoaderCircle, X } from "lucide-react";
import Link from "next/link";
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
  metode_pembayaran?: "cash" | "transfer";
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
  const [openMetodeModal, setOpenMetodeModal] = useState(false);
  const [selectedMetode, setSelectedMetode] = useState("cash");
  const [page, setPage] = useState(1);

  const [selectedNominal, setSelectedNominal] = useState<
    Record<string, number>
  >({});

  const [form, setForm] = useState({
    bulan: "",
    tahun: new Date().getFullYear(),
    nominal: 0,
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  const ADMIN_EMAILS = ["yusuf.onaola@gmail.com"];

  const isAdmin = ADMIN_EMAILS.includes(user?.email ?? "");

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
    rumah_id,
    bulan,
    tahun,
    nominal,
    status,
    created_by,
    created_at,
    updated_at,
    updated_by,
    metode_pembayaran,
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
        // .eq("rumah.status", "active")
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
  // const filteredIPL = useMemo(() => {
  //   return ipl.filter((item) => {
  //     const nama = item.rumah?.warga?.nama ?? "";
  //     const matchSearch = nama.toLowerCase().includes(search.toLowerCase());
  //     const matchBulan = filterBulan
  //       ? item.bulan.toLowerCase() === filterBulan.toLowerCase()
  //       : true;
  //     const matchBlok = filterBlok ? item.rumah?.blok === filterBlok : true;
  //     return matchSearch && matchBulan && matchBlok;
  //   });
  // }, [ipl, search, filterBulan, filterBlok]);

  const filteredIPL = useMemo(() => {
    return ipl.filter((item) => {
      const keyword = search.toLowerCase().trim();

      const nama = item.rumah?.warga?.nama?.toLowerCase() || "";
      const blok = item.rumah?.blok?.toLowerCase() || "";
      const noRumah = item.rumah?.no_rumah?.toLowerCase() || "";

      const alamatRumah = `${blok} ${noRumah}`;
      const alamatRumah2 = `${blok}-${noRumah}`;
      const alamatRumah3 = `${blok}${noRumah}`;

      const matchSearch =
        keyword === "" ||
        nama.includes(keyword) ||
        blok.includes(keyword) ||
        noRumah.includes(keyword) ||
        alamatRumah.includes(keyword) ||
        alamatRumah2.includes(keyword) ||
        alamatRumah3.includes(keyword);

      const matchBulan = filterBulan
        ? item.bulan.toLowerCase() === filterBulan.toLowerCase()
        : true;

      return matchSearch && matchBulan;
    });
  }, [ipl, search, filterBulan]);

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
    id: string,
    metode: string,
    wargaNama: string = "",
    blok: string = "",
    noRumah: string = "",
  ) {
    const wargaDisplayName = wargaNama
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());

    setActionLoading(true);

    try {
      // Normalize types before comparison to avoid mismatches between number and string
      const item = ipl.find((x) => String(x.id) === String(id));

      if (!item) throw new Error("Tagihan tidak ditemukan.");

      // ==========================
      // NOMINAL YANG DIPILIH
      // ==========================
      const nominal = selectedNominal[id] ?? item.nominal;

      // ==========================
      // UPDATE TAGIHAN IPL
      // ==========================
      const { error: tagihanError } = await supabase
        .from("tagihan_ipl")
        .update({
          status: "LUNAS",
          nominal,
          metode_pembayaran: metode,
          updated_by: user?.email || "Admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (tagihanError) throw tagihanError;

      // ==========================
      // UPDATE STATUS RUMAH (safely handle missing rumah)
      // ==========================
      const rumahId = item.rumah?.id;

      if (rumahId) {
        const { error: rumahError } = await supabase
          .from("rumah")
          .update({
            status: nominal === 20000 ? "non_active" : "active",
          })
          .eq("id", rumahId);

        if (rumahError) throw rumahError;
      } else {
        // If rumah is missing, log a warning and continue
        console.warn(
          `Rumah not found for tagihan id=${id}, skipping rumah status update.`,
        );
      }

      await getDataIPL();

      toast.success(`Pembayaran ${wargaDisplayName} berhasil dicatat.`);

      setOpenMetodeModal(false);
      setSelectedIpl(null);

      // bersihkan pilihan nominal sementara
      setSelectedNominal((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err: any) {
      console.error(err);

      toast.error(err.message);
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
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-black transition-colors">
            Dashboard
          </Link>

          <span>/</span>
          <span className="font-medium text-black">Data IPL</span>
        </div>
        {/* HEADER */}
        <div className="mb-6">
          {/* <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Data IPL</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tagihan iuran lingkungan warga
            </p>
          </div> */}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={exportExcel}
              className="h-12 rounded-xl bg-green-600 text-white font-medium shadow-sm active:scale-95 transition"
            >
              Export Excel
            </button>
            <button
              disabled={isAdmin ? false : true}
              onClick={() => setOpenModal(true)}
              className="h-12 rounded-xl bg-black text-white font-medium shadow-sm active:scale-95 transition"
            >
              + Generate IPL
            </button>
          </div>
        </div>

        {/* FILTER */}
        <div className="sticky top-0 z-50 mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2">
            <h2 className="text-gray-400 uppercase font-black">
              Nama, blok atau nomor rumah
            </h2>

            {/* <p className="mt-1 text-base text-gray-500">
              Cari berdasarkan nama warga, blok atau nomor rumah
            </p> */}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="A3A25"
            className="w-full h-14 rounded-3xl border-2 border-gray-200 px-4 text-2xl font-black outline-none focus:border-black"
          />
        </div>

        {/* MOBILE CARD */}
        <div className="md:hidden space-y-3">
          {paginatedData.length === 0 && (
            <div className="bg-white rounded-3xl border p-8 text-center text-gray-500">
              Tidak ada data IPL
            </div>
          )}

          {paginatedData.map((item) => {
            const isLunas = item.status?.toLowerCase() === "lunas";

            const penagih = item.updated_by
              ? item.updated_by
                  .split("@")[0]
                  .replace(/\./g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())
              : "-";

            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-3xl border ${isLunas ? "bg-green-100" : "bg-yellow-300"} p-4 shadow-sm transition-all ${
                  isLunas ? "border-green-100" : "border-yellow-100"
                }`}
              >
                {/* STRIP STATUS */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    isLunas ? "bg-green-500" : "bg-yellow-500"
                  }`}
                />

                <div className="pl-3">
                  {/* HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedIpl(item);
                        setOpenModalDetail(true);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                          Blok
                        </span>

                        <span className="font-bold text-gray-900 text-2xl">
                          {item.rumah?.blok}/{item.rumah?.no_rumah}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-gray-700 uppercase">
                        {item.rumah?.warga?.nama ?? "-"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                        isLunas
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {isLunas ? "✓ LUNAS" : "BELUM BAYAR"}
                    </span>
                  </div>

                  {/* DIVIDER */}
                  <div className="my-4 border-t border-gray-100" />

                  {/* DETAIL */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Periode</p>

                      <p className="font-semibold text-gray-700">
                        {item.bulan} {item.tahun}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">Nominal</p>

                      <select
                        disabled={isLunas}
                        value={selectedNominal[item.id] ?? item.nominal}
                        onChange={(e) =>
                          setSelectedNominal((prev) => ({
                            ...prev,
                            [item.id]: Number(e.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold"
                      >
                        <option value={item.nominal}>
                          Rp {Number(item.nominal).toLocaleString("id-ID")}
                        </option>

                        <option value={20000}>Rp 20.000 (Belum Huni)</option>
                      </select>
                    </div>
                  </div>

                  {/* STATUS ACTION */}
                  {!isLunas ? (
                    <button
                      disabled={actionLoading}
                      onClick={() => {
                        setSelectedIpl(item);
                        setSelectedMetode("cash");
                        setOpenMetodeModal(true);
                      }}
                      className="mt-4 h-11 w-full rounded-2xl bg-green-600 text-white font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      Bayar IPL
                    </button>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-green-600 font-bold">
                            Pembayaran Berhasil
                          </p>

                          <p className="mt-1">
                            <span className="block text-xs text-gray-400">
                              Diterima Oleh
                            </span>
                            <span className="text-sm font-semibold text-gray-600 uppercase">
                              {penagih}
                            </span>
                          </p>
                        </div>

                        <div
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                            item.metode_pembayaran === "transfer"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.metode_pembayaran === "transfer"
                            ? "💳 Transfer"
                            : "💵 Cash"}
                        </div>
                      </div>

                      {item.updated_at && (
                        <div className="mt-3 border-t border-green-200 pt-3">
                          <p className="text-xs text-gray-400">Dibayar pada</p>

                          <p className="text-sm font-medium text-gray-700">
                            {new Date(item.updated_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
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
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4 text-left">Rumah / Warga</th>
                  <th className="px-5 py-4 text-left">Periode</th>
                  <th className="px-5 py-4 text-left">Nominal</th>
                  <th className="px-5 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      Tidak ada data IPL
                    </td>
                  </tr>
                )}

                {paginatedData.map((item) => {
                  const isLunas = item.status?.toLowerCase() === "lunas";

                  const penagih = item.updated_by
                    ? item.updated_by
                        .split("@")[0]
                        .replace(/\./g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : "-";

                  return (
                    <tr
                      key={item.id}
                      className={`border-t hover:bg-gray-50 transition ${
                        isLunas
                          ? "border-l-4 border-l-green-500"
                          : "border-l-4 border-l-yellow-500"
                      }`}
                    >
                      {/* RUMAH / WARGA */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedIpl(item);
                            setOpenModalDetail(true);
                          }}
                          className="group text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                              Blok
                            </span>

                            <span className="font-black text-lg text-gray-900 transition group-hover:text-blue-600">
                              {item.rumah?.blok}/{item.rumah?.no_rumah}
                            </span>
                          </div>

                          <p className="mt-1 font-medium uppercase text-gray-700 transition group-hover:text-blue-600">
                            {item.rumah?.warga?.nama ?? "-"}
                          </p>

                          <span className="mt-1 inline-block text-xs text-blue-600 opacity-0 transition group-hover:opacity-100">
                            Lihat Detail →
                          </span>
                        </button>
                      </td>

                      {/* PERIODE */}
                      <td className="px-5 py-4 font-medium text-gray-700">
                        {item.bulan} {item.tahun}
                      </td>

                      {/* NOMINAL */}
                      <td className="px-5 py-4 font-black text-gray-900">
                        Rp {Number(item.nominal).toLocaleString("id-ID")}
                      </td>

                      {/* STATUS + AKSI */}
                      <td className="px-5 py-4 text-center">
                        {isLunas ? (
                          <div className="inline-flex flex-col items-center gap-2">
                            <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-700">
                              ✓ LUNAS
                            </span>

                            <div className="text-xs text-gray-500">
                              <div>{penagih}</div>

                              <div className="mt-1">
                                {item.metode_pembayaran === "transfer"
                                  ? "💳 Transfer"
                                  : "💵 Cash"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            disabled={actionLoading}
                            onClick={() => {
                              setSelectedIpl(item);
                              setSelectedMetode("cash");
                              setOpenMetodeModal(true);
                            }}
                            className="rounded-xl bg-yellow-100 px-4 py-2 text-xs font-bold text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                          >
                            Bayar IPL
                          </button>
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
          <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
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

        {/* METODE PEMBAYARAN */}
        {openMetodeModal && selectedIpl && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl">
              <h3 className="text-lg font-bold">Konfirmasi Pembayaran</h3>

              <p className="text-lg text-gray-500 mt-1 uppercase font-semibold">
                {selectedIpl?.rumah?.warga?.nama}
              </p>

              <p className="text-2xl text-gray-700 font-black">
                Blok {selectedIpl?.rumah?.blok}/{selectedIpl?.rumah?.no_rumah}
              </p>

              <div className="mt-4">
                <p className="text-sm font-medium mb-3">Metode Pembayaran</p>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedMetode("cash")}
                    className={`w-full h-12 rounded-2xl border text-left px-4 transition ${
                      selectedMetode === "cash"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    💵 Cash
                  </button>

                  <button
                    onClick={() => setSelectedMetode("transfer")}
                    className={`w-full h-12 rounded-2xl border text-left px-4 transition ${
                      selectedMetode === "transfer"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    💳 Transfer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => {
                    setOpenMetodeModal(false);
                    setSelectedIpl(null);
                  }}
                  className="h-11 rounded-2xl border border-gray-300 font-medium"
                >
                  Batal
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() =>
                    bayarIpl(
                      selectedIpl.id.toString(),
                      selectedMetode,
                      selectedIpl.rumah?.warga?.nama,
                      selectedIpl.rumah?.blok,
                      selectedIpl.rumah?.no_rumah,
                    )
                  }
                  className="h-11 rounded-2xl bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
