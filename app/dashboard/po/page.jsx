// SECTION: PO Dashboard Landing Page
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Building, 
  Clock, 
  Users, 
  CheckCircle,
  FileCheck2,
  CalendarDays,
  ArrowRight
} from "lucide-react";
import useEvents from "@/hooks/useEvents";
import StatsCard from "@/components/StatsCard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PoDashboard() {
  const router = useRouter();
  const { events } = useEvents();

  const pendingEvents = events ? events.filter((e) => e.status === "pending_approval") : [];
  const pendingCerts = events ? events.filter((e) => e.sertifikatStatus === "pending") : [];
  const totalParticipants = events ? events.reduce((acc, curr) => acc + (curr.peserta?.length || 0), 0) : 0;
  const completedCount = events ? events.filter((e) => e.eventStatus === "selesai").length : 0;

  return (
    <ProtectedRoute allowedRoles={["po"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="dashboard-po-root">
        
        {/* PO BANNER WELCOME */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-xs gap-4 mb-2">
          <div>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest font-black py-1 px-3 rounded-md">
              Project Officer (PO)
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none mt-2">
              Panel Pengambil Kebijakan
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5 max-w-sm">
              Lakukan tinjauan administratif terhadap event kepanitiaan baru, monitoring presensi harian, dan setujui penandatanganan sertifikat elektronik mahasiswa.
            </p>
          </div>
          <div className="flex border-t border-slate-100 pt-4 sm:pt-0 sm:border-0 gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard/po/approval")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              Approval Event {pendingEvents.length > 0 && `(${pendingEvents.length})`}
            </button>
            <button
              onClick={() => router.push("/dashboard/po/sertifikat")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Approval Sertifikat {pendingCerts.length > 0 && `(${pendingCerts.length})`}
            </button>
          </div>
        </div>

        {/* PO METRICS GRID BOX – 2 COLS MOBILE / 4 COLS DESKTOP */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Segenap Event"
            value={events.length}
            icon={Building}
            colorClass="bg-blue-50 text-blue-600 border border-blue-100"
          />
          <StatsCard
            title="Persetujuan Event"
            value={pendingEvents.length}
            icon={Clock}
            colorClass="bg-amber-50 text-amber-600 border border-amber-100"
          />
          <StatsCard
            title="Total Pendaftar"
            value={totalParticipants}
            icon={Users}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <StatsCard
            title="Event Selesai"
            value={completedCount}
            icon={CheckCircle}
            colorClass="bg-slate-50 text-slate-600"
          />
        </div>

        {/* DOUBLE COLUMN PANELS – DUAL DECISIONS LISTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PENDING EVENT APPROVALS COLS */}
          <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between border-slate-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-amber-500 shrink-0" />
                  Persetujuan Event Pending
                </h3>
                <button
                  onClick={() => router.push("/dashboard/po/approval")}
                  className="text-[11px] text-[#1a56db] font-bold hover:underline"
                >
                  Saring Semua
                </button>
              </div>

              {pendingEvents.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400 font-medium">
                  ✓ Semua pengajuan event sudah terproses bersih!
                </p>
              ) : (
                <div className="space-y-3.5 max-h-60 overflow-y-auto">
                  {pendingEvents.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition-all border border-slate-100">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-slate-800 truncate">{item.nama}</h4>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{item.penyelenggara} &bull; {item.kategori}</span>
                      </div>
                      <button
                        onClick={() => router.push("/dashboard/po/approval")}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 py-1.5 px-3 rounded-lg shrink-0 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        Tinjau
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PENDING CERTIFICATE APPROVALS COLS */}
          <div className="bg-white border rounded-3xl p-5 md:p-6 shadow-xs flex flex-col justify-between border-slate-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Rilis Sertifikat Antrean
                </h3>
                <button
                  onClick={() => router.push("/dashboard/po/sertifikat")}
                  className="text-[11px] text-[#1a56db] font-bold hover:underline"
                >
                  Sering Semua
                </button>
              </div>

              {pendingCerts.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400 font-medium font-medium">
                  ✓ Antrean pengajuan sertifikat kosong.
                </p>
              ) : (
                <div className="space-y-3.5 max-h-60 overflow-y-auto">
                  {pendingCerts.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 hover:bg-slate-100/50 rounded-xl transition-all border border-slate-100">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-slate-800 truncate">{item.nama}</h4>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Diikuti: {item.peserta?.filter(p => p.statusHadir === 'hadir').length} Hadir</span>
                      </div>
                      <button
                        onClick={() => router.push("/dashboard/po/sertifikat")}
                        className="text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg shrink-0 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Tinjau
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
