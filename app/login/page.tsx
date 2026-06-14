"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold">
              RT28
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Portal Warga Daru Raya</h1>

            <p className="text-gray-500 mt-2">
              Login untuk melihat tagihan IPL dan informasi warga lainnya
            </p>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Button */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-2xl font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Sistem Informasi Warga Daru Raya
          </div>
        </div>
      </div>
    </div>
  );
}
