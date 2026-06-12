"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function DetailIpl({ data }: { data: any }) {
  const [rumahData, setRumahData] = useState<any>(null);
  const [iplData, setIplData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { blok, no_rumah } = data.rumah;

    const { data: rumah } = await supabase
      .from("rumah")
      .select(
        `
        id,
        blok,
        no_rumah,
        alamat,
        warga (
          nama,
          no_hp
        )
      `,
      )
      .ilike("blok", blok)
      .ilike("no_rumah", no_rumah)
      .single();

    if (!rumah) {
      setLoading(false);
      return;
    }

    setRumahData(rumah);

    const { data: tagihan } = await supabase
      .from("tagihan_ipl")
      .select("*")
      .eq("rumah_id", rumah.id)
      .order("tahun", { ascending: false })
      .order("created_at", { ascending: false });

    setIplData(tagihan || []);
    setLoading(false);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  const total = iplData?.length || 0;

  const lunas =
    iplData?.filter((i) => i.status?.toLowerCase() === "lunas").length || 0;

  const belum =
    iplData?.filter((i) => i.status?.toLowerCase() !== "lunas").length || 0;

  const tunggakan =
    iplData
      ?.filter((i) => i.status?.toLowerCase() !== "lunas")
      .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-5 pt-8 pb-8 rounded-b-[32px]">
        <p className="text-white/60 text-sm">Data Warga</p>

        <h1 className="text-3xl font-bold mt-1 capitalize">
          {rumahData?.warga?.nama}
        </h1>

        <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
          <span className="text-sm">
            Blok {rumahData?.blok} / {rumahData?.no_rumah}
          </span>
        </div>

        {rumahData?.warga?.no_hp && (
          <p className="text-white/60 text-sm mt-3">
            {rumahData?.warga?.no_hp}
          </p>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 -mt-5">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Tagihan</p>

            <h2 className="text-3xl font-bold mt-2">{total}</h2>
          </div>

          <div className="bg-green-500 text-white rounded-3xl p-4">
            <p className="text-xs text-green-100">Lunas</p>

            <h2 className="text-3xl font-bold mt-2">{lunas}</h2>
          </div>

          <div className="bg-yellow-400 rounded-3xl p-4">
            <p className="text-xs text-yellow-900">Belum Bayar</p>

            <h2 className="text-3xl font-bold mt-2 text-yellow-900">{belum}</h2>
          </div>

          <div className="bg-red-500 text-white rounded-3xl p-4">
            <p className="text-xs text-red-100">Tunggakan</p>

            <h2 className="text-lg font-bold mt-2">
              Rp {tunggakan.toLocaleString("id-ID")}
            </h2>
          </div>
        </div>

        {/* TITLE */}
        <div className="mt-8 mb-4">
          <h2 className="font-bold text-lg">Riwayat IPL</h2>

          <p className="text-sm text-gray-500">Daftar pembayaran IPL warga</p>
        </div>

        {/* EMPTY */}
        {!iplData?.length && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            <p className="text-gray-500">Belum ada data IPL</p>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-3 pb-10">
          {iplData?.map((item) => {
            const isLunas = item.status?.toLowerCase() === "lunas";

            return (
              <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm">
                {/* HEADER CARD */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-base">
                      {item.bulan} {item.tahun}
                    </p>

                    <p className="text-gray-500 text-sm mt-1">Tagihan IPL</p>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                      isLunas
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {isLunas ? "LUNAS" : "BELUM BAYAR"}
                  </span>
                </div>

                {/* NOMINAL */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">Nominal</p>

                  <p className="font-bold text-lg">
                    Rp {Number(item.nominal || 0).toLocaleString("id-ID")}
                  </p>
                </div>

                {/* INFO PEMBAYARAN */}
                {isLunas && (
                  <div className="mt-4 pt-4 border-t border-green-100">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <span>✅</span>

                      <span>
                        Lunas oleh{" "}
                        <span className="font-semibold">
                          {item.updated_by || "Admin"}
                        </span>
                      </span>
                    </div>

                    {item.updated_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Dibayar pada{" "}
                        {new Date(item.updated_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
