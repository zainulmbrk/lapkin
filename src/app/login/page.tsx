"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { logActivity } from "@/src/lib/logger"; // 1. Impor fungsi logger
import { LogIn, Lock, UserCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("nip", nip.trim())
        .eq("password", password)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setErrorMsg("NIP atau Password salah. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      // 2. Catat ke log aktivitas sistem bahwa user ini berhasil login
      await logActivity(
        data.id,
        "LOGIN",
        `Pegawai ${data.name} (NIP: ${data.nip}) berhasil masuk ke sistem.`,
      );

      // Simpan session user ke localStorage
      localStorage.setItem("user_session", JSON.stringify(data));

      // Redirect ke halaman utama
      router.push("/");
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan: " + (err.message || "Gagal login"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans ">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-200">
            <UserCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Sistem Laporan & Absensi
          </h1>
          <p className="text-xs text-slate-500">
            Silakan login menggunakan NIP Anda
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              NIP (Nomor Induk Pegawai)
            </label>
            <input
              type="text"
              required
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Masukkan NIP Anda"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all pr-10"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md hover:shadow-blue-200 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
