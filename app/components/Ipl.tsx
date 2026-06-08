"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

export default function IPLPage() {
  const [ipl, setIPL] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // MODAL
  const [openModal, setOpenModal] = useState(false);

  // SEARCH
  const [search, setSearch] = useState("");

  // FILTER
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  // PAGINATION
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

    const { data, error } = await supabase
      .from("tagihan_ipl")
      .select(
        `
        id,
        bulan,
        tahun,
        nominal,
        status,
        created_at,
        rumah:rumah_id (
          id,
          no_rumah,
          blok,
          warga (
            nama,
            no_hp
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("IPL ERROR:", error.message);
      setIPL([]);
      setLoading(false);
      return;
    }

    setIPL(data || []);
    setLoading(false);
  }

  useEffect(() => {
    getDataIPL();
  }, []);

  // =========================
  // RESET PAGE
  // =========================
  useEffect(() => {
    setPage(1);
  }, [search, filterBulan, filterTahun]);

  // =========================
  // FILTER DATA
  // =========================
  const filteredIPL = useMemo(() => {
    return ipl.filter((item) => {
      const nama = item.rumah?.warga?.nama || "";

      const matchSearch = nama.toLowerCase().includes(search.toLowerCase());

      const matchBulan = filterBulan
        ? item.bulan.toLowerCase() === filterBulan.toLowerCase()
        : true;

      const matchTahun = filterTahun
        ? String(item.tahun) === filterTahun
        : true;

      return matchSearch && matchBulan && matchTahun;
    });
  }, [ipl, search, filterBulan, filterTahun]);

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(filteredIPL.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return filteredIPL.slice(start, end);
  }, [filteredIPL, page]);

  // =========================
  // EXPORT EXCEL
  // =========================
  function exportExcel() {
    if (filteredIPL.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    const dataExport = filteredIPL.map((item, index) => ({
      No: index + 1,

      Nama_Warga: item.rumah?.warga?.nama || "-",

      Blok: item.rumah?.blok || "-",

      No_Rumah: item.rumah?.no_rumah || "-",

      Periode: `${item.bulan} ${item.tahun}`,

      Nominal: item.nominal,

      Status: item.status === "lunas" ? "LUNAS" : "BELUM BAYAR",

      No_HP: item.rumah?.warga?.no_hp || "-",

      Created_At: new Date(item.created_at).toLocaleString("id-ID"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExport);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data IPL");

    XLSX.writeFile(workbook, `data-ipl-${Date.now()}.xlsx`);
  }

  // =========================
  // GENERATE IPL
  // =========================
  async function handleGenerate() {
    if (!form.bulan || !form.nominal) {
      alert("Bulan & nominal wajib diisi");
      return;
    }

    setActionLoading(true);

    const { data: rumah, error } = await supabase.from("rumah").select("id");

    if (error) {
      alert(error.message);
      setActionLoading(false);
      return;
    }

    const tagihan = (rumah || []).map((r) => ({
      rumah_id: r.id,
      bulan: form.bulan,
      tahun: form.tahun,
      nominal: form.nominal,
      status: "belum_bayar",
    }));

    const { error: insertError } = await supabase
      .from("tagihan_ipl")
      .insert(tagihan);

    setActionLoading(false);

    if (insertError) {
      alert(insertError.message);
      return;
    }

    setOpenModal(false);

    setForm({
      bulan: "",
      tahun: new Date().getFullYear(),
      nominal: 0,
    });

    await getDataIPL();

    alert("IPL berhasil digenerate");
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
      .replace(/\b\w/g, (l: string) => l.toUpperCase());

    if (
      !confirm(
        `Konfirmasi pembayaran IPL untuk ${wargaDisplayName} (${blok}/${noRumah}) ?`,
      )
    )
      return;

    setActionLoading(true);

    const { error } = await supabase
      .from("tagihan_ipl")
      .update({ status: "lunas" })
      .eq("id", id);

    setActionLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    getDataIPL();
  }

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
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-3xl font-bold">Data IPL</h1>

            <p className="text-gray-500">Tagihan iuran lingkungan</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl"
            >
              Export Excel
            </button>

            <button
              onClick={() => setOpenModal(true)}
              className="bg-black text-white px-5 py-3 rounded-xl"
            >
              + Generate IPL
            </button>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white border rounded-2xl p-4 mb-5">
          <div className="grid md:grid-cols-4 gap-3">
            {/* SEARCH */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama warga..."
              className="border px-4 py-3 rounded-xl outline-none"
            />

            {/* BULAN */}
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="border px-4 py-3 rounded-xl outline-none"
            >
              <option value="">Semua Bulan</option>

              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Maret">Maret</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Juni">Juni</option>
              <option value="Juli">Juli</option>
              <option value="Agustus">Agustus</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Desember">Desember</option>
            </select>

            {/* TAHUN */}
            <input
              type="number"
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              placeholder="Filter Tahun"
              className="border px-4 py-3 rounded-xl outline-none"
            />

            {/* RESET */}
            <button
              onClick={() => {
                setSearch("");
                setFilterBulan("");
                setFilterTahun("");
              }}
              className="border rounded-xl px-4 py-3 hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Nama Warga</th>

                  <th className="px-4 py-3 text-left">Nomor Rumah</th>

                  <th className="px-4 py-3 text-left">Periode</th>

                  <th className="px-4 py-3 text-left">Nominal</th>

                  <th className="px-4 py-3 text-left">Status</th>

                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      Tidak ada data IPL
                    </td>
                  </tr>
                )}

                {paginatedData.map((item) => {
                  const isLunas = item.status === "lunas";

                  return (
                    <tr key={item.id} className="border-t">
                      {/* NAMA */}
                      <td className="px-4 py-3 font-medium capitalize">
                        {item.rumah?.warga?.nama || "-"}
                      </td>

                      {/* RUMAH */}
                      <td className="px-4 py-3 text-gray-600">
                        Blok {item.rumah?.blok} • {item.rumah?.no_rumah}
                      </td>

                      {/* PERIODE */}
                      <td className="px-4 py-3">
                        {item.bulan} {item.tahun}
                      </td>

                      {/* NOMINAL */}
                      <td className="px-4 py-3 font-semibold">
                        Rp {Number(item.nominal).toLocaleString("id-ID")}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isLunas
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {isLunas ? "LUNAS" : "BELUM"}
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="px-4 py-3 text-right">
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
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs disabled:opacity-50"
                          >
                            Bayar
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
              Menampilkan {(page - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(page * PAGE_SIZE, filteredIPL.length)} dari{" "}
              {filteredIPL.length} data
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              <div className="px-4 py-2 text-sm font-medium">
                {page} / {totalPages}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-4 py-2 border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* TOTAL */}
        <div className="mt-4 text-sm text-gray-500">
          Total Data: {filteredIPL.length}
        </div>

        {/* MODAL */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Generate IPL</h2>

              {/* BULAN */}
              <select
                value={form.bulan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bulan: e.target.value,
                  })
                }
                className="w-full border px-3 py-2 rounded-xl mb-3"
              >
                <option value="">Pilih Bulan</option>

                <option value="Januari">Januari</option>
                <option value="Februari">Februari</option>
                <option value="Maret">Maret</option>
                <option value="April">April</option>
                <option value="Mei">Mei</option>
                <option value="Juni">Juni</option>
                <option value="Juli">Juli</option>
                <option value="Agustus">Agustus</option>
                <option value="September">September</option>
                <option value="Oktober">Oktober</option>
                <option value="November">November</option>
                <option value="Desember">Desember</option>
              </select>

              {/* TAHUN */}
              <input
                type="number"
                placeholder="Tahun"
                value={form.tahun}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tahun: Number(e.target.value),
                  })
                }
                className="w-full border px-3 py-2 rounded-xl mb-3"
              />

              {/* NOMINAL */}
              <input
                type="number"
                placeholder="Nominal"
                value={form.nominal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nominal: Number(e.target.value),
                  })
                }
                className="w-full border px-3 py-2 rounded-xl mb-4"
              />

              {/* BUTTON */}
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
      </div>
    </div>
  );
}
