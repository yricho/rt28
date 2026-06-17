"use client";

import { supabase } from "@/app/lib/supabase";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        window.location.replace("/dashboard");
        return;
      }

      setCheckingAuth(false);
    }

    checkSession();
  }, []);

  async function login() {
    try {
      if (!email || !password) {
        toast.error("Email dan password wajib diisi");
        return;
      }

      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Login berhasil");

      window.location.replace("/dashboard");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold">
              RT28
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Portal Warga Daru Raya</h1>

            <p className="text-gray-500 mt-2">
              Login untuk melihat tagihan IPL dan informasi warga lainnya
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>

            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
              className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-2xl font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            Sistem Informasi Warga Daru Raya
          </div>
        </div>
      </div>
    </div>
  );
}
