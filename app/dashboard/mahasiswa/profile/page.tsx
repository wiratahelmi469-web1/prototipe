"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { User, Clipboard, Save, HelpCircle } from "lucide-react";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function MahasiswaProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [prodi, setProdi] = useState("Teknik Informatika");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (!user || user.role !== "mahasiswa") {
      router.push("/login");
      return;
    }
    setName(user.name);
  }, [user, router]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (user) {
      // Re-sign in with updated credentials
      login(user.email, user.role, name);
      addToast("Profil Mahasiswa sukses diperbarui di dalam sistem!", "success");
    }
  };

  if (!user) return null;

  return (
    <Workspace id="mahasiswa_profile_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-2xl mx-auto space-y-6" id="mhs_profile_viewport">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Biodata Mahasiswa</h2>
          <p className="text-xs text-stone-500 mt-1">Lengkapi data diri Anda untuk disematkan saat cetak e-Sertifikat resmi.</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">EMAIL AKADEMIK (STABIL)</label>
              <input
                type="text"
                disabled
                className="w-full text-xs bg-stone-105 border border-stone-200 text-stone-400 rounded-xl px-4 py-3 cursor-not-allowed font-mono"
                value={user.email}
              />
            </div>

            <div>
              <label htmlFor="student_name_field" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">NAMA LENGKAP PENERIMA SERTIFIKAT</label>
              <div className="relative">
                <input
                  id="student_name_field"
                  type="text"
                  required
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label htmlFor="student_major" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">PROGRAM STUDI (PRODI)</label>
              <div className="relative">
                <select
                  id="student_major"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 cursor-pointer appearance-none font-semibold"
                  value={prodi}
                  onChange={(e) => setProdi(e.target.value)}
                >
                  <option value="Teknik Informatika">Teknik Informatika (TI)</option>
                  <option value="Sistem Informasi">Sistem Informasi (SI)</option>
                  <option value="Sains Data">Sains Data (SD)</option>
                  <option value="Bisnis Digital">Bisnis Digital (BD)</option>
                </select>
                <Clipboard className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              id="save_mhs_profile_btn"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </Workspace>
  );
}
