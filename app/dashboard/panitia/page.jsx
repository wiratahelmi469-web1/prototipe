// SECTION: Panitia Dashboard Home View
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  FolderGit2, 
  Clock, 
  Users2, 
  TrendingUp, 
  Plus, 
  Camera, 
  Award 
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import StatsCard from "@/components/StatsCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PanitiaDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { events } = useEvents();

  const myEvents = (user && events) ? events.filter(
    (e) => e.pengajuEmail?.toLowerCase() === user.email?.toLowerCase()
  ) : [];

  const pendingCount = myEvents.filter((e) => e.status === "pending_approval").length;
  const activeCount = myEvents.filter((e) => e.status === "approved" && e.eventStatus !== "selesai").length;
  const totalPeserta = myEvents.reduce((acc, curr) => acc + (curr.peserta?.length || 0), 0);

  return (
    <ProtectedRoute allowedRoles={["panitia"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="dashboard-panitia-root">
        
        {/* WELCOME STRIP */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-xs gap-4 mb-2">
          <div>
            <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-widest font-black py-1 px-3 rounded-md">
              Divisi Acara
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none mt-2">
              Halo, Rekan {user?.nama?.split(" ")[0]}!
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5 max-w-sm">
              Kelola lembar kepanitiaan, monitoring RSVP pendaftar mahasiswa, verifikasi presensi scan QR, dan ajukan sertifikat disini.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto justify-stretch sm:justify-start">
            <button
              onClick={() => router.push("/dashboard/panitia/events")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4.5 rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Ajukan Event
            </button>
            <button
              onClick={() => router.push("/dashboard/panitia/scan")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-purple-400" />
              Presensi Scan
            </button>
          </div>
        </div>

        {/* PANITIA STATS METRICS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Event Saya"
            value={myEvents.length}
            icon={FolderGit2}
            colorClass="bg-purple-50 text-purple-600 border border-purple-100"
          />
          <StatsCard
            title="Pending Approval"
            value={pendingCount}
            icon={Clock}
            colorClass="bg-amber-50 text-amber-600"
          />
          <StatsCard
            title="Total Pendaftar"
            value={totalPeserta}
            icon={Users2}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <StatsCard
            title="Event Aktif"
            value={activeCount}
            icon={TrendingUp}
            colorClass="bg-blue-50 text-blue-600"
          />
        </div>

        {/* CAROUSEL PANEL SECTION: EVENT SUMMARY LIST */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider">
              Ikhtisar Kelola Event Anda
            </h3>
            <button
              onClick={() => router.push("/dashboard/panitia/events")}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Lihat Kelola Lanjutan &rarr;
            </button>
          </div>

          {myEvents.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400 font-medium">
              Anda belum mengajukan gagasan kegiatan event apapun saat ini.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {myEvents.slice(0, 3).map((item) => {
                // Color codes for status badge
                const pillColor = {
                  approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
                  pending_approval: "bg-amber-50 text-amber-700 border-amber-100",
                  rejected: "bg-red-50 text-red-700 border-red-100",
                };
                return (
                  <div key={item.id} className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wide">
                        {item.kategori}
                      </span>
                      <h4 className="font-extrabold text-slate-800 text-xs mt-0.5 truncate max-w-sm sm:max-w-md">
                        {item.nama}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {item.tanggal} &bull; {item.lokasi}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 border rounded-md ${pillColor[item.status]}`}>
                        {item.status === "approved" ? "Disetujui" : item.status === "pending_approval" ? "Persetujuan" : "Ditolak"}
                      </span>
                      <button
                        onClick={() => router.push(`/events/${item.id}`)}
                        className="text-[10.5px] border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
