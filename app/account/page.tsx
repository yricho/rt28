"use client";

import { supabase } from "@/app/lib/supabase";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rumahData, setRumahData] = useState<any>(null);
  const [iplData, setIplData] = useState<any[]>([]);

  useEffect(() => {
    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: akunRumah, error } = await supabase
        .from("akun_rumah")
        .select(
          `
          rumah (
            id,
            blok,
            no_rumah,
            alamat,
            warga (
              nama,
              no_hp
            )
          )
        `,
        )
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      const rumah = Array.isArray(akunRumah?.rumah)
        ? akunRumah.rumah[0]
        : akunRumah?.rumah;

      setRumahData(rumah);

      if (!rumah?.id) {
        return;
      }

      const { data: tagihan, error: tagihanError } = await supabase
        .from("tagihan_ipl")
        .select("*")
        .eq("rumah_id", rumah.id)
        .order("tahun", { ascending: false })
        .order("created_at", {
          ascending: false,
        });

      if (tagihanError) {
        console.error(tagihanError);
        return;
      }

      setIplData(tagihan || []);
    } catch (err) {
      console.error(err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!rumahData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm max-w-sm w-full text-center">
          <h2 className="text-xl font-bold">Data Rumah Belum Terhubung</h2>

          <p className="text-gray-500 mt-3">
            Akun Anda belum terhubung ke data rumah. Silakan hubungi admin RT
            untuk menghubungkan akun Anda.
          </p>
        </div>
      </div>
    );
  }

  // =====================
  // STATS
  // =====================

  const total = iplData.length;

  const lunas = iplData.filter(
    (i) => i.status?.toLowerCase() === "lunas",
  ).length;

  const belum = iplData.filter(
    (i) => i.status?.toLowerCase() !== "lunas",
  ).length;

  const tunggakan = iplData
    .filter((i) => i.status?.toLowerCase() !== "lunas")
    .reduce((acc, curr) => acc + Number(curr.nominal || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-white p-5 rounded-b-3xl shadow-sm">
        <p className="text-gray-500 text-sm">Halo 👋</p>

        <h1 className="text-2xl font-bold capitalize">
          {rumahData.warga?.nama}
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Blok {rumahData.blok} / {rumahData.no_rumah}
        </p>

        {rumahData.warga?.no_hp && (
          <p className="text-gray-400 text-xs mt-1">{rumahData.warga.no_hp}</p>
        )}
      </div>

      {/* TITLE */}
      <h2 className="p-4 text-lg font-bold uppercase">Tagihan IPL</h2>

      <div className="px-4 space-y-4">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Tagihan</p>

            <p className="text-xl font-bold">{total}</p>
          </div>

          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs text-green-600">Lunas</p>

            <p className="text-xl font-bold text-green-700">{lunas}</p>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-4">
            <p className="text-xs text-yellow-600">Belum Bayar</p>

            <p className="text-xl font-bold text-yellow-700">{belum}</p>
          </div>

          <div className="bg-red-50 rounded-2xl p-4">
            <p className="text-xs text-red-600">Tunggakan</p>

            <p className="text-sm font-bold text-red-700">
              Rp {tunggakan.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* LIST IPL */}
        <div className="space-y-3 pb-10">
          {iplData.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
              Belum ada data IPL
            </div>
          )}

          {iplData.map((item) => {
            const isLunas = item.status?.toLowerCase() === "lunas";

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">
                    {item.bulan} {item.tahun}
                  </p>

                  <p className="text-sm text-gray-500">
                    Rp {Number(item.nominal).toLocaleString("id-ID")}
                  </p>
                </div>

                <div
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    isLunas
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {isLunas ? "LUNAS" : "BELUM BAYAR"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="text-sm text-red-600 px-3 py-1 rounded-lg border border-red-600"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
