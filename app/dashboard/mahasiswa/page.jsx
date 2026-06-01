// SECTION: Student Dashboard Welcome Board
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Compass, 
  Award, 
  Calendar, 
  HelpCircle, 
  ArrowRight,
  ClipboardList,
  Sparkles
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import StatsCard from "@/components/StatsCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { events } = useEvents();

  const mhsEvents = (user && events) ? events.filter((evt) =>
    evt.peserta?.some((p) => p.email.toLowerCase() === user.email.toLowerCase())
  ) : [];

  const certsCount = mhsEvents.filter(
    (evt) =>
      evt.sertifikatStatus === "approved" &&
      evt.peserta?.some((p) => p.email.toLowerCase() === user.email.toLowerCase() && p.statusHadir === "hadir")
  ).length;

  const upcomingCount = mhsEvents.filter((evt) =>
    evt.eventStatus === "buka" || evt.eventStatus === "segera"
  ).length;

  // Recent 3 events available to sign up (Approved and Buka/Segera)
  const availableEvents = events
    .filter((e) => e.status === "approved" && (e.eventStatus === "buka" || e.eventStatus === "segera"))
    .slice(0, 3);

  return (
    <ProtectedRoute allowedRoles={["mahasiswa"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="dashboard-student-root">
        
        {/* HERO BANNER SECTION */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-none">
              Halo, {user?.nama}! 👋
            </h2>
            <p className="text-xs md:text-sm text-blue-100 font-medium max-w-sm">
              Semoga harimu produktif. Mari kembangkan keilmuan dan kepanitiaan Anda dengan mengikuti kegiatan seru hari ini.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => router.push("/events")}
              className="bg-[#f59e0b] hover:bg-amber-600 text-white font-extrabold text-[11px] py-3 px-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              Cari Event &rarr;
            </button>
            <button
              onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
              className="bg-slate-900/30 border border-white/10 text-white font-bold text-[11px] py-3 px-4 rounded-xl transition-all hover:bg-slate-900/50 cursor-pointer"
            >
              Lihat Tiket
            </button>
          </div>
        </div>

        {/* METRICS STATS TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Event Saya Ikuti"
            value={mhsEvents.length}
            icon={ClipboardList}
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatsCard
            title="Lencana Sertifikat"
            value={certsCount}
            icon={Award}
            colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
          />
          <StatsCard
            title="Agenda Mendatang"
            value={upcomingCount}
            icon={Calendar}
            colorClass="bg-purple-50 text-purple-600"
          />
        </div>

        {/* RECENT HIGHLIGHTED CAROUSEL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Recommended available events */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                Rekomendasi Event Pilihan
              </h3>
              <button
                onClick={() => router.push("/events")}
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Jelajahi
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {availableEvents.length === 0 ? (
              <p className="text-center py-10 bg-white border rounded-2xl text-xs text-slate-400 font-medium">
                Belum ada rekomendasi baru.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableEvents.slice(0, 2).map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => router.push(`/events/${item.id}`)}
                    className="bg-white border rounded-2xl p-4 hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between h-40 select-none border-slate-200"
                  >
                    <div>
                      <span className="text-[9px] font-bold text-[#1a56db] uppercase tracking-widest">{item.kategori}</span>
                      <h4 className="font-extrabold text-slate-900 text-xs mt-1 leading-snug line-clamp-2">{item.nama}</h4>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                      <span>{item.tanggal}</span>
                      <span className="font-bold text-slate-700">{item.kuotaTerisi}/{item.kuotaMax} Kuota</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Quick triggers list */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider">Tautan Cepat</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-xs">
              <button
                onClick={() => router.push("/dashboard/mahasiswa/events")}
                className="w-full text-left py-3 px-3.5 hover:bg-slate-50 border border-transparent hover:border-slate-150 rounded-xl transition-all cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between"
              >
                <span>Daftar Event Aktif</span>
                <span className="text-[#1a56db] font-bold">&rarr;</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
                className="w-full text-left py-3 px-3.5 hover:bg-slate-50 border border-transparent hover:border-slate-150 rounded-xl transition-all cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between"
              >
                <span>Klaim Sertifikat Digital</span>
                <span className="text-[#1a56db] font-bold">&rarr;</span>
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="w-full text-left py-3 px-3.5 hover:bg-slate-50 border border-transparent hover:border-slate-150 rounded-xl transition-all cursor-pointer text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between"
              >
                <span>Edit Info Profil</span>
                <span className="text-[#1a56db] font-bold">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
