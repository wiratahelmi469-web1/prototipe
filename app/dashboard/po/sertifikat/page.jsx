// SECTION: PO Certificate Digital Signature Approval Console
"use client";

import { useEffect, useState } from "react";
import { 
  Award, 
  CheckSquare, 
  HelpCircle, 
  Users, 
  CalendarDays, 
  CheckCircle,
  Hash, 
  UserCheck 
} from "lucide-react";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";

export default function PoCertificateSigning() {
  const { events, signCertificates } = useEvents();
  const { showToast } = useToast();

  const pendingCerts = events ? events.filter((e) => e.sertifikatStatus === "pending") : [];

  const handleSignSubmit = (evtId) => {
    const res = signCertificates(evtId);
    if (res.success) {
      showToast("Tanda tangan digital dibubuhkan! Sertifikat resmi terbit ke dashboard mahasiswa! 🎉", "success");
    } else {
      showToast(res.error, "error");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["po"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="po-certificate-signing-root">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Penandatanganan Sertifikat Kegiatan
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
            Ulas data presensi mahasiswa yang hadir di pelaksanaan kegiatan panitia. Bubuhkan penandatanganan elektronik resmi dari Pimpinan Kemahasiswaan.
          </p>
        </div>

        {/* WORK BENCH VIEWLIST */}
        {pendingCerts.length === 0 ? (
          <EmptyState
            judul="Tidak Ada Antrean"
            deskripsi="Semua pengajuan rilis sertifikat digital dari Panitia saat ini sudah bersih ditandatangani."
            ikon={CheckSquare}
          />
        ) : (
          <div className="bg-white border rounded-3xl border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider">
              Daftar Antrean Pengajuan Sertifikat Elektronik
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-2">Agenda Event</th>
                    <th className="pb-3 px-2">Tanggal Selesai</th>
                    <th className="pb-3 px-2">Kehadiran (Peserta)</th>
                    <th className="pb-3 px-2">Divisi Pengaju</th>
                    <th className="pb-3 pl-2 text-right">Aksi Penandatanganan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pendingCerts.map((e) => {
                    const attendingList = e.peserta?.filter((p) => p.statusHadir === "hadir") || [];
                    
                    return (
                      <tr key={e.id} id={`cert-pending-row-${e.id}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-2 font-bold text-slate-950 truncate max-w-[200px]">{e.nama}</td>
                        <td className="py-4 px-2 whitespace-nowrap">{e.tanggal}</td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            <strong>{attendingList.length}</strong> / {e.peserta?.length || 0} Mahasiswa
                          </span>
                        </td>
                        <td className="py-4 px-2 truncate max-w-[140px]">{e.penyelenggara}</td>
                        <td className="py-4 pl-2 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleSignSubmit(e.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10.5px] py-1.5 px-3.5 rounded-lg cursor-pointer transition-colors hover:scale-[1.01] flex items-center justify-center gap-1 inline-flex ml-auto"
                            id={`btn-sign-cert-${e.id}`}
                          >
                            <Award className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                            Tandatangani & Terbitkan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
