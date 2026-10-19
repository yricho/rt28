"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Stats() {
  const [stats, setStats] = useState({
    rumah: 0,
    iplLunas: 0,
  });

  const [loading, setLoading] = useState(true);

  async function getStats() {
    try {
      // Jalankan query secara paralel agar tidak saling menunggu.
      const [rumahRes, iplLunas] = await Promise.all([
        supabase.from("rumah").select("id", { count: "exact", head: true }),

        supabase
          .from("tagihan_ipl")
          .select(
            `
            id,
            rumah!inner(status)
            `,
            {
              count: "exact",
              head: true,
            },
          )
          .ilike("status", "lunas")
          .eq("rumah.status", "active"),
      ]);

      setStats({
        rumah: rumahRes.count || 0,
        iplLunas: iplLunas.count || 0,
      });
    } catch (error) {
      console.error("Gagal memuat statistik:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Ambil data awal setelah komponen terpasang.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-3xl border p-6 animate-pulse h-28" />
        <div className="bg-white rounded-3xl border p-6 animate-pulse h-28" />
        <div className="bg-white rounded-3xl border p-6 animate-pulse h-28" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      {/* IPL LUNAS */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <p className="text-gray-500 text-sm">IPL Lunas</p>
        <h2 className="text-4xl font-bold mt-2 text-green-600">
          {stats.iplLunas}
        </h2>
      </div>

      {/* RUMAH */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <p className="text-gray-500 text-sm">Total Rumah</p>
        <h2 className="text-4xl font-bold mt-2 text-gray-900">{stats.rumah}</h2>
      </div>

      {/* WARGA */}
      {/* <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <p className="text-gray-500 text-sm">Total Warga</p>
        <h2 className="text-4xl font-bold mt-2 text-gray-900">{stats.warga}</h2>
      </div> */}

      {/* IPL BELUM BAYAR */}
      {/* <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <p className="text-gray-500 text-sm">IPL Belum Bayar</p>
        <h2 className="text-4xl font-bold mt-2 text-red-600">
          {stats.iplBelumBayar}
        </h2>
      </div> */}
    </div>
  );
}
