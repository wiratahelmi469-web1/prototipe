"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { UserPlus, Mail, User, Shield, KeyRound, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function RegisterPage() {
  const { registerUser, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mahasiswa");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const emailWithDomain = email.includes("@") ? email : `${email}@nurulfikri.ac.id`;

    try {
      await registerUser(name, emailWithDomain, role);
      setMessage("Registrasi berhasil! Menyiapkan profil baru...");

      // Automatically log inside the registered user session
      setTimeout(async () => {
        await login(emailWithDomain, role, name);
        setLoading(false);
      }, 1200);
    } catch (err) {
      setMessage("Terjadi kesalahan registrasi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center px-4 py-12 relative" id="register_viewport">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10" />

      <Link
        href="/login"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-navy transition-colors font-semibold"
        id="back_to_login_link"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Login
      </Link>

      <div className="w-full max-w-md" id="register_form_container">
        {/* Card Header */}
        <div className="text-center mb-6">
          <span className="inline-flex p-3 rounded-2xl bg-navy-tint border border-navy-light/10 text-navy mb-3.5 shadow-xs">
            <UserPlus className="w-6 h-6 text-[#F5A623]" />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-stone-950">
            Daftar Anggota Universitas
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Bergabung dengan ekosistem kemahasiswaan Universitas Nurul Fikri
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white border border-stone-200/80 rounded-2xl shadow-md p-6 md:p-8">
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2 mb-4 animate-pulse">
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name_input" className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  id="name_input"
                  type="text"
                  required
                  placeholder="Ahmad Junaidi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4.5 py-3 pl-11 outline-hidden focus:border-navy-light focus:bg-white transition-all font-semibold text-stone-850"
                />
                <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label htmlFor="email_input" className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
                Email Universitas
              </label>
              <div className="relative">
                <input
                  id="email_input"
                  type="text"
                  required
                  placeholder="mahasiswa@nurulfikri.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4.5 py-3 pl-11 outline-hidden focus:border-navy-light focus:bg-white transition-all font-semibold text-stone-850"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label htmlFor="role_input" className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
                Role / Hak Akses Portal
              </label>
              <div className="relative">
                <select
                  id="role_input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4.5 py-3 pl-11 outline-hidden focus:border-navy-light focus:bg-white transition-all font-semibold cursor-pointer appearance-none text-stone-850"
                >
                  <option value="mahasiswa">Mahasiswa / Peserta Publik</option>
                  <option value="panitia">Panitia Pelaksana Kegiatan</option>
                  <option value="po">Project Officer (PO)</option>
                  <option value="staff">Staf Kemahasiswaan Kampus</option>
                </select>
                <Shield className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password_input" className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="password_input"
                  type="password"
                  required
                  placeholder="Buat password sulit"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4.5 py-3 pl-11 outline-hidden focus:border-navy-light focus:bg-white transition-all font-semibold text-stone-850"
                />
                <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-xs bg-navy hover:bg-navy-mid text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              id="submit_register_btn"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Menyiapkan Akun..." : "Buat Akun & Masuk Hub"}
            </button>
          </form>

          {/* Already registered */}
          <div className="text-center mt-5 pt-4 border-t border-stone-100">
            <span className="text-xs text-stone-400">Sudah punya akun? </span>
            <Link href="/login" className="text-xs font-bold text-navy hover:text-navy-mid transition-all" id="go_to_login_link">
              Sign In Disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
