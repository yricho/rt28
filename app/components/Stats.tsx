"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Stats() {
  const [stats, setStats] = useState({
    warga: 0,
    rumah: 0,
    iplBelumBayar: 0,
    iplLunas: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats();
  }, []);

  async function getStats() {
    setLoading(true);

    // =====================
    // TOTAL WARGA
    // =====================
    const wargaRes = await supabase
      .from("warga")
      .select("id", { count: "exact", head: true });

    // =====================
    // TOTAL RUMAH
    // =====================
    const rumahRes = await supabase
      .from("rumah")
      .select("id", { count: "exact", head: true });

    // // =====================
    // // IPL BELUM BAYAR
    // // =====================
    // const iplBelum = await supabase
    //   .from("tagihan_ipl")
    //   .select("id", { count: "exact", head: true })
    //   .eq("status", "belum_bayar");

    // // =====================
    // // IPL LUNAS
    // // =====================
    // const iplLunas = await supabase
    //   .from("tagihan_ipl")
    //   .select("id", { count: "exact", head: true })
    //   .eq("status", "lunas");

    // IPL BELUM BAYAR
    const iplBelum = await supabase
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
      .eq("status", "belum_bayar")
      .eq("rumah.status", "active");

    // IPL LUNAS
    const iplLunas = await supabase
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
      .eq("status", "lunas")
      .eq("rumah.status", "active");

    setStats({
      warga: wargaRes.count || 0,
      rumah: rumahRes.count || 0,
      iplBelumBayar: iplBelum.count || 0,
      iplLunas: iplLunas.count || 0,
    });

    setLoading(false);
  }

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
