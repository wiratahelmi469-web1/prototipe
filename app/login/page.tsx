"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, DEFAULT_USERS } from "../../context/AuthContext";
import { KeyRound, Mail, Sparkles, LogIn, ArrowLeft, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const { login, registeredUsers } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const emailClean = email.trim().toLowerCase();
    const pwdClean = password.trim();

    // Check against standard initial accounts or registered list
    const foundPreset = DEFAULT_USERS.find(
      (u) => u.email.toLowerCase() === emailClean && u.password === pwdClean
    );

    if (foundPreset) {
      await login(foundPreset.email, foundPreset.role, foundPreset.name);
      setLoading(false);
      return;
    }

    // fallback to registered list (passwords default)
    const foundRegistered = registeredUsers.find(
      (u) => u.email.toLowerCase() === emailClean
    );

    if (foundRegistered) {
      // Allow any password for newly registered accounts to simplify tests
      await login(foundRegistered.email, foundRegistered.role, foundRegistered.name);
      setLoading(false);
      return;
    }

    setErrorMsg("Email atau password tidak terdaftar. Periksa kredensial / pilih Kredensial Preset di bawah.");
    setLoading(false);
  };

  const handlePresetLogin = async (presetEmail: string, role: string, name: string) => {
    setLoading(true);
    await login(presetEmail, role, name);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center px-4 py-12 relative" id="login_viewport">
      {/* Decorative Subtle Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10" />

      <Link
        href="/events"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-indigo-600 transition-colors font-semibold"
        id="back_to_events_link"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Event Publik
      </Link>

      <div className="w-full max-w-md" id="login_form_container">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <span className="inline-flex p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3.5 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-stone-950">
            Masuk ke EventHub Kampus
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gunakan akun universitas Anda untuk mengakses portal koordinasi
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-stone-200/80 rounded-2xl shadow-md p-6 md:p-8">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-start gap-2 mb-4" id="login_error_box">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label htmlFor="email_entry" className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
                Email Universitas
              </label>
              <div className="relative">
                <input
                  id="email_entry"
                  type="email"
                  required
                  placeholder="name@nurulfikri.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4.5 py-3 pl-11 outline-hidden focus:border-indigo-500/80 focus:bg-white transition-all font-semibold"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password_entry" className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password_entry"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4.5 py-3 pl-11 outline-hidden focus:border-indigo-500/80 focus:bg-white transition-all font-semibold"
                />
                <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="submit_login_btn"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Menghubungkan..." : "Sign In Sekarang"}
            </button>
          </form>

          {/* New to EventHub link */}
          <div className="text-center mt-5 pt-4 border-t border-stone-100">
            <span className="text-xs text-stone-400">Belum punya akun? </span>
            <Link href="/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-all" id="go_to_register_link">
              Registrasi Disini
            </Link>
          </div>
        </div>

        {/* PRESET KREDENSIAL FOR COZY TESTING */}
        <div className="mt-8 bg-stone-100/50 p-5 rounded-2xl border border-stone-200" id="preset_accounts_card">
          <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AKUN DEMO KILAT (KLIK UNTUK LOGIN INSTAN)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_USERS.map((preset) => (
              <button
                key={preset.email}
                onClick={() => handlePresetLogin(preset.email, preset.role, preset.name)}
                className="p-3 bg-white hover:bg-indigo-50 border border-stone-200/50 rounded-xl text-left hover:border-indigo-300 transition-all shadow-xs shrink-0 cursor-pointer"
                id={`preset_login_${preset.role}`}
              >
                <p className="text-xs font-bold text-stone-800 line-clamp-1">{preset.name.split(" ")[0]} ({preset.role.toUpperCase()})</p>
                <code className="text-[8px] font-mono text-stone-400 block mt-0.5 truncate">{preset.email}</code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
