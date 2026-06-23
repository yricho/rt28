"use client";

import { Pencil, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 10;

export default function Warga() {
  const [warga, setWarga] = useState<any[]>([]);
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
  const [noRumah, setNoRumah] = useState("");
  const [alamat, setAlamat] = useState("");

  useEffect(() => {
    getData();
  }, []);

  // =========================
  // GET DATA
  // =========================
  async function getData() {
    setLoading(true);

    const { data } = await supabase
      .from("warga")
      .select("*")
      .order("nama", { ascending: true });

    setWarga(data || []);
    setLoading(false);
  }

  function resetForm() {
    setNama("");
    setNik("");
    setNoHp("");
    setNoRumah("");
    setAlamat("");

    setEditMode(false);
    setEditId("");
  }

  function handleEdit(item: any) {
    setEditMode(true);
    setEditId(item.id);

    setNama(item.nama || "");
    setNik(item.nik || "");
    setNoHp(item.no_hp || "");

    setOpenModal(true);
  }

  const filteredWarga = useMemo(() => {
    return warga.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.nama?.toLowerCase().includes(keyword) ||
        item.nik?.toLowerCase().includes(keyword) ||
        item.no_hp?.toLowerCase().includes(keyword)
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

  // =========================
  // TAMBAH WARGA
  // =========================
  async function tambahWarga(e: any) {
    e.preventDefault();

    if (!nama || !noHp) {
      alert("Nama dan No HP wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const { data: wargaBaru, error: errWarga } = await supabase
        .from("warga")
        .insert([
          {
            nama,
            nik: nik || null,
            no_hp: noHp,
          },
        ])
        .select()
        .single();

      if (errWarga) {
        alert(errWarga.message);
        return;
      }

      const { error: errRumah } = await supabase.from("rumah").insert([
        {
          warga_id: wargaBaru.id,
          no_rumah: noRumah,
          alamat,
        },
      ]);

      if (errRumah) {
        alert(errRumah.message);
        return;
      }

      // RESET
      setNama("");
      setNik("");
      setNoHp("");
      setNoRumah("");
      setAlamat("");

      setOpenModal(false);

      await getData();

      alert("Warga berhasil ditambahkan");
    } finally {
      setLoading(false);
    }
  }

  async function simpanWarga(e: any) {
    e.preventDefault();

    if (!nama || !noHp) {
      alert("Nama dan No HP wajib diisi");
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

        if (error) {
          alert(error.message);
          return;
        }

        alert("Data warga berhasil diperbarui");
      } else {
        const { error } = await supabase.from("warga").insert([
          {
            nama,
            nik: nik || null,
            no_hp: noHp,
          },
        ]);

        if (error) {
          alert(error.message);
          return;
        }

        alert("Warga berhasil ditambahkan");
      }

      resetForm();
      setOpenModal(false);

      await getData();
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // DELETE
  // =========================
  async function hapusWarga(id: number) {
    if (!confirm("Hapus warga ini?")) return;

    await supabase.from("warga").delete().eq("id", id);

    getData();
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
            disabled
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

              <tbody>
                {paginatedWarga.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">
                      Tidak ada data warga
                    </td>
                  </tr>
                )}

                {paginatedWarga.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium capitalize">
                      {item.nama}
                    </td>

                    <td className="px-4 py-3 text-center">{item.nik ?? "-"}</td>

                    <td className="px-4 py-3 text-center">
                      {item.no_hp ?? "-"}
                    </td>

                    {/* <td className="px-4 py-3 text-gray-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("id-ID")
                        : "-"}
                    </td> */}

                    {/* <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => hapusWarga(item.id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs"
                      >
                        Hapus
                      </button>
                    </td> */}

                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => handleEdit(item)}
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

              {/* NO RUMAH */}
              {/* <input
                placeholder="No Rumah"
                value={noRumah}
                onChange={(e) =>
                  setNoRumah(e.target.value)
                }
                className="w-full border rounded-xl px-3 py-2"
              /> */}

              {/* ALAMAT */}
              {/* <textarea
                placeholder="Alamat"
                value={alamat}
                onChange={(e) =>
                  setAlamat(e.target.value)
                }
                className="w-full border rounded-xl px-3 py-2"
              /> */}

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
