"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 10;

export default function Rumah() {
  const [rumah, setRumah] = useState<any[]>([]);
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [form, setForm] = useState({
    id: null as number | null,
    warga_id: "",
    blok: "",
    no_rumah: "",
    alamat: "",
  });

  // =====================
  // DEBOUNCE SEARCH
  // =====================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // RESET PAGE WHEN SEARCH
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // =====================
  // INIT LOAD
  // =====================
  useEffect(() => {
    getDataWarga();
  }, []);

  useEffect(() => {
    getDataRumah();
  }, [debouncedSearch, page]);

  // =====================
  // GET RUMAH
  // =====================
  async function getDataRumah() {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("rumah")
      .select(
        `
        id,
        warga_id,
        blok,
        no_rumah,
        alamat,
        created_at,
        warga (
          id,
          nama,
          no_hp
        )
      `,
        { count: "exact" },
      )
      .order("blok", { ascending: true })
      .range(from, to);

    if (debouncedSearch) {
      query = query.or(
        `no_rumah.ilike.%${debouncedSearch}%,blok.ilike.%${debouncedSearch}%,alamat.ilike.%${debouncedSearch}%`,
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("GET RUMAH ERROR:", error.message);
      setLoading(false);
      return;
    }

    setRumah(data || []);
    setTotalData(count || 0);

    setLoading(false);
  }

  // =====================
  // GET WARGA
  // =====================
  async function getDataWarga() {
    const { data, error } = await supabase
      .from("warga")
      .select("id, nama, no_hp")
      .order("nama");

    if (error) {
      console.error(error.message);
      return;
    }

    setWarga(data || []);
  }

  // =====================
  // SUBMIT
  // =====================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.no_rumah || !form.blok) {
      alert("Blok & No Rumah wajib diisi");
      return;
    }

    const payload = {
      warga_id: form.warga_id || null,
      blok: form.blok,
      no_rumah: form.no_rumah,
      alamat: form.alamat,
    };

    if (editMode && form.id) {
      const { error } = await supabase
        .from("rumah")
        .update(payload)
        .eq("id", form.id);

      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from("rumah").insert(payload);

      if (error) return alert(error.message);
    }

    resetForm();
    getDataRumah();
  }

  // =====================
  // RESET FORM
  // =====================
  function resetForm() {
    setForm({
      id: null,
      warga_id: "",
      blok: "",
      no_rumah: "",
      alamat: "",
    });

    setEditMode(false);
    setOpenModal(false);
  }

  // =====================
  // EDIT
  // =====================
  function handleEdit(item: any) {
    setForm({
      id: item.id,
      warga_id: item.warga_id || "",
      blok: item.blok || "",
      no_rumah: item.no_rumah || "",
      alamat: item.alamat || "",
    });

    setEditMode(true);
    setOpenModal(true);
  }

  const totalPages = Math.ceil(totalData / PAGE_SIZE);

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">Data Rumah</h1>

            <p className="text-gray-500">
              Kelola rumah berdasarkan blok & warga
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-black text-white px-5 py-3 rounded-2xl"
          >
            + Tambah Rumah
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white border rounded-2xl p-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari blok / no rumah / alamat..."
            className="w-full border rounded-xl px-4 py-3 outline-none"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading data rumah...
          </div>
        )}

        {/* EMPTY */}
        {!loading && rumah.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Tidak ada data rumah
          </div>
        )}

        {/* TABLE */}
        {!loading && rumah.length > 0 && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  {/* HEADER */}
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Blok / No</th>
                      <th className="px-4 py-3">Pemilik</th>
                      <th className="px-4 py-3">No HP</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {rumah.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        {/* BLOK */}
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {item.blok} - {item.no_rumah}
                        </td>

                        {/* WARGA */}
                        <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                          {item.warga?.nama ?? "Belum ada"}
                        </td>

                        {/* NO HP */}
                        <td className="px-4 py-3 text-gray-600">
                          {item.warga?.no_hp ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-5">
              <p className="text-sm text-gray-500">
                Menampilkan {(page - 1) * PAGE_SIZE + 1} -{" "}
                {Math.min(page * PAGE_SIZE, totalData)} dari {totalData} data
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
          </>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:w-[500px] p-5 rounded-t-3xl md:rounded-3xl">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Rumah" : "Tambah Rumah"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* WARGA */}
              <select
                value={form.warga_id}
                onChange={(e) =>
                  setForm({ ...form, warga_id: e.target.value })
                }
                className="w-full border rounded-xl px-3 py-2"
              >
                <option value="">Pilih Warga</option>

                {warga.map((w) => (
                  <option key={w.id} value={w.id} className="capitalize">
                    {w.nama
                      .toLowerCase()
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </option>
                ))}
              </select>

              {/* BLOK */}
              <input
                value={form.blok}
                onChange={(e) => setForm({ ...form, blok: e.target.value })}
                placeholder="Blok (contoh: A3A)"
                className="w-full border rounded-xl px-3 py-2"
              />

              {/* NO RUMAH */}
              <input
                value={form.no_rumah}
                onChange={(e) =>
                  setForm({ ...form, no_rumah: e.target.value })
                }
                placeholder="No Rumah"
                className="w-full border rounded-xl px-3 py-2"
              />

              {/* BUTTON */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border rounded-xl py-2"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-black text-white rounded-xl py-2"
                >
                  {editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}