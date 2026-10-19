"use client";

import {
  Bell,
  Building2,
  CreditCard,
  Home,
  LoaderCircle,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Stats from "../components/Stats";
import { supabase } from "../lib/supabase";

const Warga = dynamic(() => import("../components/Warga"), {
  loading: () => <SectionLoader />,
});

const Rumah = dynamic(() => import("../components/Rumah"), {
  loading: () => <SectionLoader />,
});

const Ipl = dynamic(() => import("../components/Ipl"), {
  loading: () => <SectionLoader />,
});

const Notifikasi = dynamic(() => import("../components/Notifikasi"), {
  loading: () => <SectionLoader />,
});

const Pengaturan = dynamic(() => import("../components/Pengaturan"), {
  loading: () => <SectionLoader />,
});

function SectionLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
    </div>
  );
}

const MENU_TITLES: Record<string, string> = {
  dashboard: "Dashboard RT 28",
  warga: "Data Warga",
  rumah: "Data Rumah",
  ipl: "Data IPL",
  notifikasi: "Notifikasi",
  pengaturan: "Pengaturan",
};

/* ========================= */
/* MAIN DASHBOARD */
/* ========================= */

export default function DashboardPage() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  async function checkSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setUser(session.user);
    } catch (error) {
      console.error("Error checking session:", error);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      if (!session) {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast.success("Berhasil keluar");

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal keluar. Silakan coba lagi.");
    } finally {
      setLoggingOut(false);
    }
  }

  function renderContent() {
    switch (activeMenu) {
      case "warga":
        return <Warga />;

      case "rumah":
        return <Rumah />;

      case "ipl":
        return <Ipl />;

      case "notifikasi":
        return <Notifikasi />;

      case "pengaturan":
        return (
          <Pengaturan
            user={user}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />
        );

      default:
        return (
          <div className="px-6 py-6 space-y-6 md:px-0">
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setActiveMenu("ipl")}
                className="bg-green-400 border border-gray-200 rounded-3xl p-6 text-left hover:shadow-lg transition"
              >
                <CreditCard className="mb-5" size={35} />
                <h3 className="text-xl font-bold">IPL</h3>
                <p className="text-gray-500 mt-2">Tagihan & pembayaran IPL</p>
              </button>

              {/* <button
                onClick={() => setActiveMenu("warga")}
                className="bg-white border border-gray-200 rounded-3xl p-6 text-left hover:shadow-lg transition"
              >
                <Users className="mb-5" size={35} />
                <h3 className="text-xl font-bold">Data Warga</h3>
                <p className="text-gray-500 mt-2">Kelola seluruh warga RT</p>
              </button> */}

              <button
                onClick={() => setActiveMenu("rumah")}
                className="bg-white border border-gray-200 rounded-3xl p-6 text-left hover:shadow-lg transition"
              >
                <Building2 className="mb-5" size={35} />
                <h3 className="text-xl font-bold">Data Rumah</h3>
                <p className="text-gray-500 mt-2">Kelola rumah & penghuni</p>
              </button>
            </div>

            <Stats />
          </div>
        );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return null;
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
            <h1 className="font-bold text-lg text-gray-900">RT 28</h1>

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
          <button
            onClick={() => setActiveMenu("notifikasi")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
              activeMenu === "notifikasi"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Bell size={20} />
            Notifikasi
          </button>

          <button
            onClick={() => setActiveMenu("pengaturan")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
              activeMenu === "pengaturan"
                ? "bg-black text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Settings size={20} />
            Pengaturan
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut size={20} />
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1">
        {/* TOPBAR */}
        <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between gap-3 px-3 sm:px-6">
          <div className="min-w-0">
            <Link href="/">
              <h2 className="truncate text-base font-bold text-gray-900 sm:text-2xl">
                {MENU_TITLES[activeMenu] ?? "Dashboard RT 28"}
              </h2>

              <p className="hidden text-sm text-gray-500 sm:block">
                Sistem Administrasi Warga
              </p>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveMenu("notifikasi")}
              title="Notifikasi"
              className={`flex items-center justify-center rounded-xl border px-3 py-2 transition md:hidden ${
                activeMenu === "notifikasi"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Bell size={18} />
            </button>

            <button
              onClick={() => setActiveMenu("pengaturan")}
              title="Pengaturan"
              className={`flex items-center justify-center rounded-xl border px-3 py-2 transition md:hidden ${
                activeMenu === "pengaturan"
                  ? "border-black bg-black text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings size={18} />
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Keluar"
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <LogOut size={18} />

              <span className="hidden sm:inline">
                {loggingOut ? "Keluar..." : "Keluar"}
              </span>
            </button>

            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
              {user?.email ? (
                user.email.charAt(0).toUpperCase()
              ) : (
                <User size={18} />
              )}
            </div>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="md:p-8">{renderContent()}</div>
      </main>
    </div>
  );
}
