// SECTION: User Profile Settings Page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Hash, 
  BriefcaseSquare, 
  Lock, 
  Save, 
  ChevronLeft,
  GraduationCap
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useToast from "@/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserProfileEdit() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [namaVal, setNamaVal] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("currentUser") || "null");
        return u ? (u.nama || "") : "";
      } catch (e) {}
    }
    return "";
  });

  const [nimNipVal, setNimNipVal] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("currentUser") || "null");
        return u ? (u.nimNip || "") : "";
      } catch (e) {}
    }
    return "";
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setNamaVal((prev) => (user.nama && user.nama !== prev ? user.nama : prev));
        setNimNipVal((prev) => (user.nimNip && user.nimNip !== prev ? user.nimNip : prev));
      }, 0);
    }
  }, [user]);

  const handleUpdateProfileSubmit = (e) => {
    e.preventDefault();

    if (!namaVal.trim()) {
      showToast("Nama lengkap tidak boleh dikosongkan.", "error");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = updateProfile({
        nama: namaVal,
        nimNip: nimNipVal,
      });

      setLoading(false);

      if (res.success) {
        showToast("Informasi profil sukses diperbarui! 👤", "success");
      } else {
        showToast("Gagal memperbarui profil.", "error");
      }
    }, 500);
  };

  return (
    <ProtectedRoute allowedRoles={["mahasiswa", "panitia", "po", "staf"]}>
      <div className="max-w-xl mx-auto space-y-6 font-sans select-none animate-fade-in" id="user-profile-settings-root">
        
        {/* HEADER BAR LINK */}
        <button
          onClick={() => router.push(`/dashboard/${user?.role}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition-colors uppercase"
          id="btn-back-dashboard-from-profile"
        >
          <ChevronLeft className="w-5 h-5" />
          Dashboard
        </button>

        {/* PROFILE CARD CARD */}
        <div className="bg-white border rounded-3xl border-slate-200 shadow-sm overflow-hidden">
          {/* Header Theme Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex flex-col sm:flex-row items-center gap-4 text-white">
            <div className="bg-white/20 p-4 rounded-2xl border border-white/10 shrink-0 select-none">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/20 border border-amber-500/20 px-2.5 py-0.5 rounded-md tracking-wider">
                Role: {user?.role?.toUpperCase()}
              </span>
              <h3 className="font-extrabold text-base md:text-lg tracking-tight text-white leading-none mt-2">
                {user?.nama}
              </h3>
              <p className="text-xs text-blue-100 mt-1 truncate max-w-sm">{user?.email}</p>
            </div>
          </div>

          {/* Form edits inputs */}
          <form onSubmit={handleUpdateProfileSubmit} className="p-6 md:p-8 space-y-5 text-xs text-slate-700">
            
            {/* NIM/NIP (ReadOnly Badge representation) */}
            <div className="bg-slate-50 p-3.5 border border-slate-100 class-variance-authority rounded-2xl grid grid-cols-2 text-[11px] gap-1 opacity-90 font-semibold mb-2">
              <span className="text-slate-400">Instansi Kampus:</span>
              <span className="font-bold text-slate-800 text-right">Universitas Nurul Fikri</span>
              <span className="text-slate-400">Status Hak Akses:</span>
              <span className="font-extrabold text-blue-600 text-right uppercase">{user?.role}</span>
            </div>

            {/* Nama Lengkap Input */}
            <div className="space-y-1.5">
              <label htmlFor="pf-nama" className="font-bold text-slate-600">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="pf-nama"
                  type="text"
                  required
                  placeholder="Ganti nama lengkap..."
                  value={namaVal}
                  onChange={(e) => setNamaVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 py-3 pl-10 pr-4 rounded-xl text-slate-800 text-xs font-bold transition-all outline-none"
                />
              </div>
            </div>

            {/* NIM / NIP Input */}
            <div className="space-y-1.5">
              <label htmlFor="pf-nimnip" className="font-bold text-slate-600">NIM ATAU NIP DOSEN</label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="pf-nimnip"
                  type="text"
                  placeholder="Ganti NIM / NIP..."
                  value={nimNipVal}
                  onChange={(e) => setNimNipVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 py-3 pl-10 pr-4 rounded-xl text-slate-800 text-xs font-bold transition-all outline-none"
                />
              </div>
            </div>

            {/* Read-only Institutional Email fields */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-400">Email Kampus (Kunci readonly)</label>
              <div className="relative opacity-65">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-slate-100 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-slate-600 text-xs font-bold cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* Submit save button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs py-3.5 rounded-xl cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5 mt-2"
              id="btn-save-profile"
            >
              {loading ? "Menyimpan..." : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
