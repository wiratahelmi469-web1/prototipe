// SECTION: Panitia Certificate Filing & Monitoring Page
"use client";

import { useEffect, useState } from "react";
import { 
  FileCheck, 
  HelpCircle, 
  Award, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import { generateCertificate } from "@/lib/generateCertificate";

export default function PanitiaCertificates() {
  const { user } = useAuth();
  const { events, updateSertifikatStatus } = useEvents();
  const { showToast } = useToast();

  const finishedEvents = (user && events) ? events.filter(
    (e) => e.pengajuEmail?.toLowerCase() === user.email?.toLowerCase() && e.eventStatus === "selesai"
  ) : [];

  const handleProposeCertificates = (evtId) => {
    const res = updateSertifikatStatus(evtId, "pending");
    if (res.success) {
      showToast("Filing usulan sertifikat berhasil diajukan ke Project Officer! 🎓", "success");
    } else {
      showToast(res.error, "error");
    }
  };

  const handleDownloadSample = (evt) => {
    try {
      // Generate standard mock preview certification PDF
      const dummyStudent = { nama: "Budi Santoso", nimNip: "2021001", email: "stud@nurulfikri.ac.id" };
      generateCertificate(evt, dummyStudent, "CERT-TEST-PREVIEW");
      showToast("Unduhan draf pratinjau sertifikat sukses! 📄", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal menerbitkan pratinjau sertifikat.", "error");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["panitia"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="panitia-certificates-filing-root">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Penyerahan Sertifikat Kegiatan
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
            Ajukan tanda tangan sertifikat elektronik dari Project Officer (PO) untuk event-event yang telah selesai dilaksanakan secara tuntas.
          </p>
        </div>

        {/* WORK BENCH VIEWLIST */}
        {finishedEvents.length === 0 ? (
          <EmptyState
            judul="Belum Ada Event Selesai"
            deskripsi="Sertifikat kegiatan hanya dapat diajukan apabila status pelaksanaan event diubah menjadi 'Selesai' di menu Kelola Event."
            ikon={Award}
          />
        ) : (
          <div className="bg-white border rounded-3xl border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider">
              Daftar Pengajuan Sertifikat Digital
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-2">Judul Event</th>
                    <th className="pb-3 px-2">Tanggal</th>
                    <th className="pb-3 px-2">Peserta Hadir</th>
                    <th className="pb-3 px-2">Status Rilis</th>
                    <th className="pb-3 pl-2 text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {finishedEvents.map((e) => {
                    const attendingCount = e.peserta?.filter((p) => p.statusHadir === "hadir").length || 0;
                    
                    const certStatusBadge = {
                      approved: "text-emerald-700 bg-emerald-50 border-emerald-100",
                      pending: "text-amber-700 bg-amber-50 border-amber-100 animate-pulse",
                      rejected: "text-red-700 bg-red-50 border-red-100",
                    };

                    return (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-2 font-bold text-slate-950 truncate max-w-[200px]">{e.nama}</td>
                        <td className="py-4 px-2 whitespace-nowrap">{e.tanggal}</td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <strong>{attendingCount}</strong> / {e.peserta?.length || 0} Hadir
                          </span>
                        </td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          {e.sertifikatStatus ? (
                            <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 border rounded-lg ${certStatusBadge[e.sertifikatStatus]}`}>
                              {e.sertifikatStatus === "approved" ? "Sudah Terbit" : e.sertifikatStatus === "pending" ? "Menunggu PO" : "Ditolak"}
                            </span>
                          ) : (
                            <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 border rounded-lg bg-slate-50 text-slate-400 border-slate-150">
                              Belum Dikirim
                            </span>
                          )}
                        </td>
                        <td className="py-4 pl-2 text-right">
                          <div className="inline-flex gap-1.5 justify-end">
                            {/* Submit Filing buttons */}
                            {!e.sertifikatStatus && (
                              <button
                                onClick={() => handleProposeCertificates(e.id)}
                                className="bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold text-[10.5px] py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                                id={`btn-propose-cert-${e.id}`}
                              >
                                Ajukan ke PO
                              </button>
                            )}

                            {/* Sample Preview certificates download */}
                            {e.sertifikatStatus === "approved" && (
                              <button
                                onClick={() => handleDownloadSample(e)}
                                className="border border-slate-250 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10.5px] py-1.5 px-3 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1"
                                id={`btn-sample-cert-${e.id}`}
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                Pratinjau draf
                              </button>
                            )}

                            {/* Display indicator info of pending process */}
                            {e.sertifikatStatus === "pending" && (
                              <span className="text-[10px] text-slate-450 italic leading-none font-medium pr-1.5">
                                Sedang ditinjau PO...
                              </span>
                            )}
                          </div>
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
