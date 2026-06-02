"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { User, ShieldCheck, Mail, Building, Bookmark } from "lucide-react";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function StaffProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [divisi, setDivisi] = useState("Unit Kegiatan Mahasiswa");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (!user || user.role !== "staff") {
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
      login(user.email, user.role, name);
      addToast("Profil Staf Kemahasiswaan berhasil disimpan!", "success");
    }
  };

  if (!user) return null;

  return (
    <Workspace id="staff_profile_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-xl mx-auto space-y-6" id="staff_profile_viewport">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Profil Administator Kampus</h2>
          <p className="text-xs text-stone-500 mt-1">Kelola data resmi Staf Kemahasiswaan untuk rujukan verifikasi ekosistem akademik.</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">EMAIL RESMI</label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  className="w-full text-xs bg-stone-105 border border-stone-200 text-stone-400 rounded-xl px-4 py-3 pl-10 cursor-not-allowed font-mono"
                  value={user.email}
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-300" />
              </div>
            </div>

            <div>
              <label htmlFor="staff_name_input" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">NAMA STAF KEMAHASISWAAN</label>
              <div className="relative">
                <input
                  id="staff_name_input"
                  type="text"
                  required
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-505 focus:bg-white transition-all font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <div>
              <label htmlFor="staff_division_picker" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">MUTU / DIVISI LAYANAN</label>
              <div className="relative">
                <select
                  id="staff_division_picker"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 cursor-pointer appearance-none outline-hidden focus:border-indigo-505 font-semibold"
                  value={divisi}
                  onChange={(e) => setDivisi(e.target.value)}
                >
                  <option value="Unit Kegiatan Mahasiswa">Unit Kegiatan Mahasiswa (UKM)</option>
                  <option value="Seksi Pelayanan Mahasiswa">Seksi Pelayanan Mahasiswa</option>
                  <option value="Bimbingan Karier &amp; Alumni">Bimbingan Karier &amp; Alumni</option>
                </select>
                <Bookmark className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              id="save_staff_profile_btn"
            >
              <ShieldCheck className="w-4 h-4" />
              Update Profil Staf &rarr;
            </button>
          </form>
        </div>
      </div>
    </Workspace>
  );
}
