"use client";

import { Info, LogOut, ShieldCheck } from "lucide-react";

type PengaturanUser = {
  id?: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
};

type PengaturanProps = {
  user: PengaturanUser | null;
  onLogout: () => void | Promise<void>;
  loggingOut: boolean;
};

function formatTanggal(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default function Pengaturan({
  user,
  onLogout,
  loggingOut,
}: PengaturanProps) {
  const email = user?.email ?? "-";
  const nama =
    user?.user_metadata?.full_name || user?.user_metadata?.name || email;
  const initial = nama && nama !== "-" ? nama.charAt(0).toUpperCase() : "?";

  return (
    <div className="px-6 py-6 space-y-6 md:px-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>

        <p className="mt-1 text-gray-500">
          Profil akun dan pengaturan sesi login
        </p>
      </div>

      <div className="grid gap-5">
        {/* PROFIL */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black text-2xl font-bold text-white">
              {initial}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-gray-900">
                {nama}
              </h2>

              <p className="text-sm text-gray-500">Akun Dashboard RT 28</p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
            <InfoRow label="Email" value={email} />
            <InfoRow label="ID Akun" value={user?.id ?? "-"} mono />
            <InfoRow label="Status Akun" value="Aktif" badge />
            <InfoRow
              label="Terakhir Masuk"
              value={formatTanggal(user?.last_sign_in_at)}
            />
            <InfoRow
              label="Akun Dibuat"
              value={formatTanggal(user?.created_at)}
            />
          </dl>
        </section>

        {/* SESI & KEAMANAN */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Sesi & Keamanan
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Keluar akan mengakhiri sesi login Anda di perangkat ini. Anda
                perlu memasukkan email dan password lagi untuk masuk.
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            disabled={loggingOut}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <LogOut size={18} />
            {loggingOut ? "Keluar..." : "Keluar dari akun"}
          </button>
        </section>

        {/* TENTANG APLIKASI */}
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
              <Info size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Tentang Aplikasi
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                RT 28 Daru Raya — Sistem Administrasi Warga.
              </p>

              <p className="mt-2 text-xs text-gray-400">Versi 0.1.0</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
  badge = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-sm text-gray-500">{label}</dt>

      <dd
        className={`text-sm text-gray-900 sm:text-right ${
          mono ? "break-all font-mono text-xs" : "font-medium"
        }`}
      >
        {badge ? (
          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
            {value}
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
