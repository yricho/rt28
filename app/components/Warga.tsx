"use client";

import type { User } from "@supabase/supabase-js";
import { Pencil, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 10;

type WargaItem = {
  id: string;
  nama: string;
  nik: string | null;
  no_hp: string | null;
};

export default function Warga() {
  const [user, setUser] = useState<User | null>(null);

  const [warga, setWarga] = useState<WargaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  const [search, setSearch] = useState("");

  // MODAL
  const [openModal, setOpenModal] = useState(false);

  // PAGINATION
  const [page, setPage] = useState(1);

  // FORM STATE
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [noHp, setNoHp] = useState("");

  useEffect(() => {
    getData();
  }, []);

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
  // GET DATA
  // =========================
  async function getData() {
    try {
      const { data, error } = await supabase
        .from("warga")
        .select("id, nama, nik, no_hp")
        .order("nama", { ascending: true });

      if (error) throw error;

      setWarga(data || []);
    } catch (error) {
      console.error("GET WARGA ERROR:", error);
      toast.error("Gagal memuat data warga");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setNama("");
    setNik("");
    setNoHp("");

    setEditMode(false);
    setEditId("");
  }

  function handleEdit(item: WargaItem) {
    setEditMode(true);
    setEditId(item.id);

    setNama(item.nama || "");
    setNik(item.nik || "");
    setNoHp(item.no_hp || "");

    setOpenModal(true);
  }

  const filteredWarga = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return warga;

    return warga.filter((item) => {
      const nama = String(item.nama ?? "").toLowerCase();
      const nik = String(item.nik ?? "").toLowerCase();
      const noHp = String(item.no_hp ?? "").toLowerCase();

      return (
        nama.includes(keyword) ||
        nik.includes(keyword) ||
        noHp.includes(keyword)
      );
    });
  }, [warga, search]);

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(filteredWarga.length / PAGE_SIZE);

  const paginatedWarga = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return filteredWarga.slice(start, end);
  }, [filteredWarga, page]);

  async function simpanWarga(e: React.FormEvent) {
    e.preventDefault();

    if (!nama || !noHp) {
      toast.error("Nama dan No HP wajib diisi");
      return;
    }

    try {
      setLoading(true);

      if (editMode) {
        const { error } = await supabase
          .from("warga")
          .update({
            nama,
            nik: nik || null,
            no_hp: noHp,
          })
          .eq("id", editId);

        if (error) throw error;

        toast.success("Data warga berhasil diperbarui");
      } else {
        const { error } = await supabase.from("warga").insert([
          {
            nama,
            nik: nik || null,
            no_hp: noHp,
          },
        ]);

        if (error) throw error;

        toast.success("Warga berhasil ditambahkan");
      }

      resetForm();
      setOpenModal(false);

      await getData();
    } catch (error) {
      console.error("SIMPAN WARGA ERROR:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan data warga",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* HEADER */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-black transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-black">Data Warga</span>
        </div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Warga</h1>

            <p className="text-gray-500 mt-1">Kelola data warga RT</p>
          </div>

          {/* BUTTON OPEN MODAL */}
          <button
            disabled={!isAdmin}
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            + Tambah Warga
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-4 mb-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari warga..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Nama</th>

                  <th className="px-4 py-3 text-center">NIK</th>

                  <th className="px-4 py-3 text-center">No HP</th>

                  {/* <th className="px-4 py-3 text-left">Tanggal Input</th> */}

                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {paginatedWarga.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">
                      Tidak ada data warga
                    </td>
                  </tr>
                )}

                {paginatedWarga.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium capitalize text-gray-900">
                      {item.nama}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-700">
                      {item.nik ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-center text-gray-700">
                      {item.no_hp ?? "-"}
                    </td>

                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        aria-label={`Edit ${item.nama}`}
                        className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs"
                      >
                        <Pencil />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-5">
            <p className="text-sm text-gray-500">
              Menampilkan {(page - 1) * PAGE_SIZE + 1} -{" "}
              {Math.min(page * PAGE_SIZE, filteredWarga.length)} dari{" "}
              {filteredWarga.length}
              data
            </p>

            <div className="flex items-center gap-2">
              {/* PREV */}
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="px-4 py-2 border rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              {/* PAGE */}
              <div className="px-4 py-2 text-sm font-medium">
                {page} / {totalPages}
              </div>

              {/* NEXT */}
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
      </div>

      {/* ================= MODAL ================= */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editMode ? "Edit Warga" : "Tambah Warga"}
              </h2>

              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={simpanWarga} className="space-y-3">
              {/* NAMA */}
              <input
                placeholder="Nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
              />

              {/* NIK */}
              <input
                placeholder="NIK (Opsional)"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
              />

              {/* NO HP */}
              <input
                placeholder="No HP"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full border rounded-xl px-3 py-2"
              />

              {/* BUTTON */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 border rounded-xl py-2"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-black text-white rounded-xl py-2"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
