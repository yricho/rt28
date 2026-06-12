"use client";

import {
  Bell,
  Building2,
  CreditCard,
  Home,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import Ipl from "../components/Ipl";
import Rumah from "../components/Rumah";
import Stats from "../components/Stats";
import Warga from "../components/Warga";

/* ========================= */
/* COMPONENT WARGA */
/* ========================= */

function WargaSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Warga</h2>

          <p className="text-gray-500 mt-1">Daftar seluruh warga RT</p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-2xl">
          + Tambah Warga
        </button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Budi Santoso
                </h3>

                <p className="text-gray-500 text-sm mt-1">Rumah A-12</p>
              </div>

              <button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================= */
/* COMPONENT RUMAH */
/* ========================= */

function RumahSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Rumah</h2>

          <p className="text-gray-500 mt-1">Data rumah dan alamat penghuni</p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-2xl">
          + Tambah Rumah
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="border border-gray-200 rounded-3xl p-5 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                🏠
              </div>

              <div>
                <h3 className="font-bold text-xl text-gray-900">A-12</h3>

                <p className="text-gray-500 text-sm">Blok Mawar</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm text-gray-500">Penghuni</p>

              <p className="font-semibold text-gray-900 mt-1">Budi Santoso</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================= */
/* COMPONENT IPL */
/* ========================= */

function IplSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tagihan IPL</h2>

          <p className="text-gray-500 mt-1">Monitoring pembayaran IPL warga</p>
        </div>

        <button className="bg-black text-white px-5 py-3 rounded-2xl">
          + Generate IPL
        </button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  Budi Santoso
                </h3>

                <p className="text-gray-500 text-sm mt-1">Rumah A-12</p>

                <p className="font-bold text-2xl text-gray-900 mt-4">
                  Rp 150.000
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium">
                  BELUM BAYAR
                </span>

                <button className="bg-green-600 text-white px-5 py-3 rounded-2xl">
                  Bayar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================= */
/* MAIN DASHBOARD */
/* ========================= */

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("dashboard");

  function renderContent() {
    switch (activeMenu) {
      case "warga":
        return <Warga />;

      case "rumah":
        return <Rumah />;

      case "ipl":
        return <Ipl />;

      default:
        return (
          <div className="px-6 space-y-6 md:px-0">
            {/* QUICK MENU */}
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveMenu("ipl")}
                className="bg-white border border-gray-200 rounded-3xl p-6 text-left hover:shadow-lg transition"
              >
                <CreditCard className="mb-5" size={35} />

                <h3 className="text-xl font-bold">IPL</h3>

                <p className="text-gray-500 mt-2">Tagihan & pembayaran IPL</p>
              </button>
              <button
                onClick={() => setActiveMenu("warga")}
                className="bg-white border border-gray-200 rounded-3xl p-6 text-left hover:shadow-lg transition"
              >
                <Users className="mb-5" size={35} />

                <h3 className="text-xl font-bold">Data Warga</h3>

                <p className="text-gray-500 mt-2">Kelola seluruh warga RT</p>
              </button>

              <button
                onClick={() => setActiveMenu("rumah")}
                className="bg-white border border-gray-200 rounded-3xl p-6 text-left hover:shadow-lg transition"
              >
                <Building2 className="mb-5" size={35} />

                <h3 className="text-xl font-bold">Data Rumah</h3>

                <p className="text-gray-500 mt-2">Kelola rumah & penghuni</p>
              </button>
            </div>
            {/* STATS */}
            <Stats />
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-gray-200 hidden md:flex flex-col">
        {/* LOGO */}
        <div className="h-20 border-b border-gray-200 flex items-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg">
            DR
          </div>

          <div className="ml-3">
            <h1 className="font-bold text-lg">RT 28</h1>

            <p className="text-sm text-gray-500">Perumahan Daru Raya</p>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveMenu("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
              activeMenu === "dashboard"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Home size={20} />
            Dashboard
          </button>

          <button
            onClick={() => setActiveMenu("warga")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
              activeMenu === "warga"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Users size={20} />
            Warga
          </button>

          <button
            onClick={() => setActiveMenu("rumah")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
              activeMenu === "rumah"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Building2 size={20} />
            Rumah
          </button>

          <button
            onClick={() => setActiveMenu("ipl")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
              activeMenu === "ipl"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <CreditCard size={20} />
            IPL
          </button>
        </div>

        {/* BOTTOM */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 text-gray-700">
            <Bell size={20} />
            Notifikasi
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 text-gray-700">
            <Settings size={20} />
            Pengaturan
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1">
        {/* TOPBAR */}
        <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Dashboard RT 28
            </h2>

            <p className="text-sm text-gray-500">Sistem Administrasi Warga</p>
          </div>

          <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-bold">
            <User size={20} />
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="py-6 md:p-8">{renderContent()}</div>
      </main>
    </div>
  );
}
