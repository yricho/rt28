export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-100 via-white to-zinc-200 flex items-center justify-center px-6">
      <div className="max-w-5xl w-full">
        <div className="bg-white border border-zinc-200 rounded-[40px] p-8 md:p-14 shadow-xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm mb-6">
                🏡 Sistem Pendataan Warga
              </div>

              <h1 className="text-5xl md:text-6xl font-black leading-tight text-zinc-900">
                Welcome
                <br />
                to RT28
              </h1>

              <p className="mt-6 text-zinc-600 text-lg leading-relaxed">
                Platform digital untuk pengelolaan data warga, rumah, dan IPL
                secara modern, cepat, dan efisien.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <a
                  href="/dashboard"
                  className="bg-black hover:bg-zinc-800 text-white px-6 py-4 rounded-2xl font-medium text-center transition"
                >
                  Masuk Dashboard
                </a>

                <a
                  href="#"
                  className="border border-zinc-300 hover:bg-zinc-100 px-6 py-4 rounded-2xl font-medium text-center transition"
                >
                  Lihat Data Rumah
                </a>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 mt-10">
                <div className="bg-zinc-100 rounded-2xl p-4">
                  <h3 className="text-2xl font-bold">RT</h3>
                  <p className="text-sm text-zinc-500">Administrasi</p>
                </div>

                <div className="bg-zinc-100 rounded-2xl p-4">
                  <h3 className="text-2xl font-bold">IPL</h3>
                  <p className="text-sm text-zinc-500">Pembayaran</p>
                </div>

                <div className="bg-zinc-100 rounded-2xl p-4">
                  <h3 className="text-2xl font-bold">Warga</h3>
                  <p className="text-sm text-zinc-500">Pendataan</p>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative">
              <div className="bg-black rounded-[32px] p-8 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-zinc-400 text-sm">Dashboard RT28</p>

                    <h2 className="text-2xl font-bold mt-1">
                      Smart Resident System
                    </h2>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
                    🏘️
                  </div>
                </div>

                <div className="space-y-4">
                  {/* CARD */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-zinc-400 text-sm">Data Rumah</p>

                    <h3 className="text-3xl font-bold mt-2">128</h3>
                  </div>

                  {/* CARD */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-zinc-400 text-sm">Warga Aktif</p>

                    <h3 className="text-3xl font-bold mt-2">412</h3>
                  </div>

                  {/* CARD */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-zinc-400 text-sm">IPL Bulan Ini</p>

                    <h3 className="text-3xl font-bold mt-2">Rp 12.5JT</h3>
                  </div>
                </div>

                <div className="mt-8 text-sm text-zinc-500">
                  RT28 Management System © 2026
                </div>
              </div>

              {/* DECORATION */}
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-zinc-300 rounded-full blur-3xl opacity-40" />

              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-zinc-400 rounded-full blur-3xl opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
