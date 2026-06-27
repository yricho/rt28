"use client";

import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 10;

export default function Rumah() {
  const [user, setUser] = useState<any>(null);

  const [rumah, setRumah] = useState<any[]>([]);
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [deleteId, setDeleteId] = useState("");
  const [deleteName, setDeleteName] = useState("");

  const [search, setSearch] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const [form, setForm] = useState({
    id: null as number | null,
    warga_id: "",
    blok: "",
    no_rumah: "",
    alamat: "",
    status: "active",
  });

  const debouncedSearch = search.trim().toLowerCase();

  const filteredRumah = useMemo(() => {
    const keyword = search.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (!keyword) return rumah;

    return rumah.filter((item) => {
      const blok = (item.blok ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

      const noRumah = String(item.no_rumah ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      const nama = (item.warga?.nama ?? "").toLowerCase();

      const alamat = (item.alamat ?? "").toLowerCase();

      const gabungan = `${blok}${noRumah}`;

      return (
        blok.includes(keyword) ||
        noRumah.includes(keyword) ||
        nama.includes(keyword) ||
        alamat.includes(keyword) ||
        gabungan.includes(keyword)
      );
    });
  }, [rumah, search]);

  const totalPages = Math.ceil(filteredRumah.length / PAGE_SIZE);

  const paginatedRumah = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredRumah.slice(start, start + PAGE_SIZE);
  }, [filteredRumah, page]);

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
  }, []);

  // =====================
  // GET RUMAH
  // =====================
  async function getDataRumah() {
    setLoading(true);

    let query = supabase
      .from("rumah")
      .select(
        `
      id,
      warga_id,
      blok,
      no_rumah,
      status,
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
      .order("blok", { ascending: true });

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
      warga_id: form.warga_id,
      blok: form.blok,
      no_rumah: form.no_rumah,
      alamat: form.alamat,
      status: form.status,
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
      status: "active",
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
      status: item.status || "active",
    });

    setEditMode(true);
    setOpenModal(true);
  }

  async function handleDelete() {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("rumah")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast.success("Rumah berhasil dihapus");

      setDeleteId("");
      setDeleteName("");

      await getDataRumah();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

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

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-black transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-black">Data Rumah</span>
        </div>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">Data Rumah</h1>
            <p className="text-gray-500">
              Kelola rumah berdasarkan blok & warga
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setOpenModal(true);
            }}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            + Tambah Rumah
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white border rounded-2xl p-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Cari blok / no rumah / nama warga"
            className="w-full border rounded-xl px-4 py-3 outline-none"
          />
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
          </div>
        )}

        {/* EMPTY */}
        {!loading && rumah.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Tidak ada data rumah
          </div>
        )}

        {/* TABLE */}
        {!loading && paginatedRumah.length > 0 && (
          <>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  {/* HEADER */}
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Blok / No</th>
                      <th className="px-4 py-3">Nama</th>
                      {/* <th className="px-4 py-3 text-center">No HP</th> */}
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {paginatedRumah.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        {/* BLOK */}
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {item.blok} / {item.no_rumah}
                        </td>

                        {/* WARGA */}
                        <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                          {item.warga?.nama ?? "Belum ada"}
                        </td>

                        {/* NO HP */}
                        {/* <td className="px-4 py-3 text-center text-gray-600">
                          {item.warga?.no_hp ?? "-"}
                        </td> */}

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status === "active" ? "Huni" : "Belum Huni"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            >
                              <Pencil />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setDeleteId(item.id);
                                  setDeleteName(
                                    `${item.blok}/${item.no_rumah}`,
                                  );
                                }}
                                className="px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                <Trash2 />
                              </button>
                            )}
                          </div>
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

            <p className="text-sm text-gray-500 mb-4">
              {editMode ? "Perbarui data rumah" : "Tambahkan data rumah baru"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* WARGA */}
              <select
                disabled={editMode}
                value={form.warga_id}
                onChange={(e) => setForm({ ...form, warga_id: e.target.value })}
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
                disabled={editMode}
                value={form.blok}
                onChange={(e) =>
                  setForm({ ...form, blok: e.target.value.toUpperCase() })
                }
                placeholder="Blok (contoh: A3A)"
                className="w-full border rounded-xl px-3 py-2"
              />

              {/* NO RUMAH */}
              <input
                disabled={editMode}
                value={form.no_rumah}
                onChange={(e) => setForm({ ...form, no_rumah: e.target.value })}
                placeholder="No Rumah"
                className="w-full border rounded-xl px-3 py-2"
              />

              {/* STATUS RUMAH */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Status Rumah
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="active">Huni</option>
                  <option value="nonactive">Belum Huni</option>
                </select>
              </div>

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
                  className={`flex-1 rounded-xl py-2 text-white ${
                    editMode ? "bg-gray-900" : "bg-black"
                  }`}
                >
                  {editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 mx-4">
            <h2 className="text-xl font-bold">Hapus Rumah</h2>

            <p className="text-gray-500 mt-2">Yakin ingin menghapus rumah:</p>

            <div className="mt-3 p-3 rounded-xl bg-gray-100 font-semibold">
              {deleteName}
            </div>

            <p className="text-sm text-red-600 mt-3">
              Data yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setDeleteId("");
                  setDeleteName("");
                }}
                className="flex-1 border rounded-xl py-3"
              >
                Batal
              </button>

              <button
                disabled={loading}
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white rounded-xl py-3 disabled:opacity-50"
              >
                {loading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
