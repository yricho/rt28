'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 20;

export default function Warga() {
  const [warga, setWarga] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // MODAL
  const [openModal, setOpenModal] = useState(false);

  // FORM STATE
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [noHp, setNoHp] = useState('');
  const [noRumah, setNoRumah] = useState('');
  const [alamat, setAlamat] = useState('');

  useEffect(() => {
    getData();
  }, [page]);

  // =========================
  // GET DATA
  // =========================
  async function getData() {
    try {
      setLoading(true);

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, count, error } = await supabase
        .from('warga')
        .select('*', { count: 'exact' })
        .order('nama', { ascending: true })
        .range(from, to);

      if (error) {
        console.error(error);
        return;
      }

      setWarga(data || []);
      setTotal(count || 0);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // TAMBAH WARGA
  // =========================
  async function tambahWarga(e: any) {
    e.preventDefault();

    if (!nama || !nik || !noHp) {
      alert('Lengkapi data');
      return;
    }

    try {
      setLoading(true);

      const { data: wargaBaru, error: errWarga } = await supabase
        .from('warga')
        .insert([
          {
            nama,
            nik,
            no_hp: noHp,
          },
        ])
        .select()
        .single();

      if (errWarga) {
        alert(errWarga.message);
        return;
      }

      if (noRumah) {
        const { error: errRumah } = await supabase.from('rumah').insert([
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
      }

      setNama('');
      setNik('');
      setNoHp('');
      setNoRumah('');
      setAlamat('');

      setOpenModal(false);

      await getData();

      alert('Warga berhasil ditambahkan');
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // DELETE
  // =========================
  async function hapusWarga(id: number) {
    if (!confirm('Hapus warga ini?')) return;

    await supabase.from('warga').delete().eq('id', id);

    getData();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const visiblePages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => {
      const start = Math.max(
        1,
        Math.min(page - 2, totalPages - 4)
      );

      return start + i;
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Data Warga
            </h1>

            <p className="text-gray-500 mt-1">
              Kelola data warga RT
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="bg-black text-white px-5 py-3 rounded-xl hover:opacity-90"
          >
            + Tambah Warga
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Nama
                  </th>

                  <th className="px-4 py-3 text-left">
                    NIK
                  </th>

                  <th className="px-4 py-3 text-left">
                    No HP
                  </th>

                  <th className="px-4 py-3 text-left">
                    Tanggal Input
                  </th>

                  {/* <th className="px-4 py-3 text-right">
                    Aksi
                  </th> */}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-gray-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : warga.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-gray-500"
                    >
                      Tidak ada data warga
                    </td>
                  </tr>
                ) : (
                  warga.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium capitalize">
                        {item.nama}
                      </td>

                      <td className="px-4 py-3">
                        {item.nik}
                      </td>

                      <td className="px-4 py-3">
                        {item.no_hp}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleDateString('id-ID')
                          : '-'}
                      </td>

                      {/* <td className="px-4 py-3 text-right">
                        <button
                          onClick={() =>
                            hapusWarga(item.id)
                          }
                          className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs"
                        >
                          Hapus
                        </button>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan {(page - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(page * PAGE_SIZE, total)}
              {' '}dari {total} warga
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPage((prev) => prev - 1)
                }
                disabled={page === 1}
                className="rounded-lg border bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-10 w-10 rounded-lg text-sm font-medium ${
                    page === pageNumber
                      ? 'bg-black text-white'
                      : 'border bg-white hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
                disabled={page === totalPages}
                className="rounded-lg border bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Tambah Warga
              </h2>

              <button
                onClick={() => setOpenModal(false)}
                aria-label="Tutup modal"
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={tambahWarga}
              className="space-y-3"
            >
              <input
                placeholder="Nama"
                value={nama}
                onChange={(e) =>
                  setNama(e.target.value)
                }
                className="w-full border rounded-xl px-3 py-2"
              />

              <input
                placeholder="NIK"
                value={nik}
                onChange={(e) =>
                  setNik(e.target.value)
                }
                className="w-full border rounded-xl px-3 py-2"
              />

              <input
                placeholder="No HP"
                value={noHp}
                onChange={(e) =>
                  setNoHp(e.target.value)
                }
                className="w-full border rounded-xl px-3 py-2"
              />

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
                  disabled={loading}
                  className="flex-1 bg-black text-white rounded-xl py-2"
                >
                  {loading
                    ? 'Menyimpan...'
                    : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}