import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6">
      {/* Background Blur */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100 blur-3xl" />

      <div className="relative z-10 max-w-xl text-center">
        <div className="mb-4 inline-flex rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
          Error 404
        </div>

        <h1 className="text-7xl font-black tracking-tight text-gray-900 md:text-8xl">
          Oops!
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800 md:text-3xl">
          Halaman tidak ditemukan
        </h2>

        <p className="mt-4 text-gray-500">
          Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau URL
          yang dimasukkan tidak valid.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:scale-[1.02]"
          >
            <Home size={18} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
