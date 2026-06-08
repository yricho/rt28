"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function IPLPage() {
  const [ipl, setIPL] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // MODAL
  const [openModal, setOpenModal] = useState(false);

  // SEARCH
  const [search, setSearch] = useState("");

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
  // FILTER SEARCH
  // =========================
  const filteredIPL = ipl.filter((item) => {
    const nama = item.rumah?.warga?.nama || "";
    return nama.toLowerCase().includes(search.toLowerCase());
  });

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
    setForm({ bulan: "", tahun: new Date().getFullYear(), nominal: 0 });

    await getDataIPL();
    alert("IPL berhasil digenerate");
  }

  // =========================
  // BAYAR
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
        `Konfirmasi pembayaran IPL untuk ${wargaDisplayName} (${blok}/ ${noRumah}) ?`,
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Data IPL</h1>
            <p className="text-gray-500">Tagihan iuran lingkungan</p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            + Generate IPL
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama warga..."
            className="w-full md:w-1/3 border px-4 py-2 rounded-xl"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Nama Warga</th>
                <th className="px-4 py-3">Nomor Rumah</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filteredIPL.map((item) => {
                const isLunas = item.status === "lunas";

                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3 font-medium capitalize">
                      {item.rumah?.warga?.nama || "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      Blok {item.rumah?.blok} • {item.rumah?.no_rumah}
                    </td>

                    <td className="px-4 py-3">
                      {item.bulan} {item.tahun}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      Rp {Number(item.nominal).toLocaleString("id-ID")}
                    </td>

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

                    <td className="px-4 py-3 text-right">
                      {!isLunas && (
                        <button
                          onClick={() =>
                            bayarIpl(
                              item.id,
                              item.rumah?.warga?.nama,
                              item.rumah?.blok,
                              item.rumah?.no_rumah,
                            )
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
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

        {/* MODAL */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-full max-w-md p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Generate IPL</h2>

              <input
                placeholder="Bulan"
                value={form.bulan}
                onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                className="w-full border px-3 py-2 rounded-xl mb-3"
              />

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
                value={form.nominal}
                onChange={(e) =>
                  setForm({ ...form, nominal: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded-xl mb-3"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setOpenModal(false)}
                  className="flex-1 border py-2 rounded-xl"
                >
                  Batal
                </button>

                <button
                  onClick={handleGenerate}
                  className="flex-1 bg-black text-white py-2 rounded-xl"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
