// SECTION: Staff Dashboard Landing Page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FolderPlus, 
  Users, 
  CalendarCheck, 
  CheckCircle, 
  Download,
  Eye, 
  Activity 
} from "lucide-react";
import useEvents from "@/hooks/useEvents";
import StatsCard from "@/components/StatsCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";
import useToast from "@/hooks/useToast";

export default function StaffDashboard() {
  const router = useRouter();
  const { events } = useEvents();
  const { showToast } = useToast();

  const totalPeserta = events ? events.reduce((acc, curr) => acc + (curr.peserta?.length || 0), 0) : 0;
  const activeCount = events ? events.filter((e) => e.status === "approved" && e.eventStatus !== "selesai").length : 0;
  const completedCount = events ? events.filter((e) => e.eventStatus === "selesai").length : 0;
  const [selectedEventLogs, setSelectedEventLogs] = useState(null);

  const exportAllEventsCsv = () => {
    if (!events || events.length === 0) {
      showToast("Data event masih kosong.", "warning");
      return;
    }

    const headers = ["ID Event", "Nama Event", "Kategori", "Penyelenggara", "Tanggal", "Jam", "Lokasi", "Kuota Max", "Kuota Terisi", "Status Admin", "Rilis Sertifikat"];
    const rows = events.map((e) => [
      e.id,
      `"${e.nama.replace(/"/g, '""')}"`,
      e.kategori,
      `"${e.penyelenggara.replace(/"/g, '""')}"`,
      e.tanggal,
      e.jam,
      `"${e.lokasi.replace(/"/g, '""')}"`,
      e.kuotaMax,
      e.kuotaTerisi,
      e.status,
      e.sertifikatStatus || "null"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Segenap_Laporan_Event_Kampus_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Laporan segenap event berhasil diekspor! 📊", "success");
  };

  return (
    <ProtectedRoute allowedRoles={["staf"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="dashboard-staff-root">
        
        {/* STAFF WELCOME STRIP */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-xs gap-4 mb-2">
          <div>
            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-widest font-black py-1 px-3 rounded-md">
              Staf Kemahasiswaan
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none mt-2">
              Panel Pengawasan Kemahasiswaan
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-normal mt-0.5 max-w-sm">
              Lakukan monitoring umum agenda yang diselenggarakan di lingkungan Universitas Nurul Fikri, serta lakukan ekspor data berkala.
            </p>
          </div>
          <button
            onClick={exportAllEventsCsv}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs py-3 px-5 rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
            id="btn-export-all-excel"
          >
            <Download className="w-4 h-4 text-rose-400" />
            Ekspor CSV Kolektif
          </button>
        </div>

        {/* STAFF METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Event"
            value={events.length}
            icon={FolderPlus}
            colorClass="bg-rose-50 text-rose-600 border border-rose-100"
          />
          <StatsCard
            title="Segenap Peserta"
            value={totalPeserta}
            icon={Users}
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatsCard
            title="Agenda Aktif"
            value={activeCount}
            icon={Activity}
            colorClass="bg-[#10b981]/10 text-[#10b981]"
          />
          <StatsCard
            title="Agenda Selesai"
            value={completedCount}
            icon={CheckCircle}
            colorClass="bg-slate-50 text-slate-600"
          />
        </div>

        {/* MASTER EVENTS REPORT TABLE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider">
              Daftar Agenda Terdaftar (Semua Status)
            </h3>
            <button
              onClick={() => router.push("/dashboard/staf/events")}
              className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Ulas Lanjutan &rarr;
            </button>
          </div>

          {events.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400 font-medium">Belum ada agenda seminar.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-2">Event</th>
                    <th className="pb-3 px-2">Kategori</th>
                    <th className="pb-3 px-2">Pihak Pengaju</th>
                    <th className="pb-3 px-2">Pendaftar</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 pl-2 text-right">Rekap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {events.slice(0, 5).map((e) => {
                    // Status styling
                    const statusTag = {
                      approved: "text-emerald-700 bg-emerald-50",
                      pending_approval: "text-amber-700 bg-amber-50",
                      rejected: "text-red-700 bg-red-50",
                    };
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 pr-2 max-w-[160px] truncate">
                          <p className="font-bold text-slate-900 truncate">{e.nama}</p>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{e.tanggal}</span>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">{e.kategori}</td>
                        <td className="py-3 px-2 truncate max-w-[140px]" title={e.penyelenggara}>{e.penyelenggara}</td>
                        <td className="py-3 px-2 font-bold text-slate-900 whitespace-nowrap">{e.kuotaTerisi}/{e.kuotaMax}</td>
                        <td className="py-3 px-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-black/5 ${statusTag[e.status]}`}>
                            {e.status === "approved" ? "Aktif" : e.status === "pending_approval" ? "Pending" : "Ditolak"}
                          </span>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <button
                            onClick={() => setSelectedEventLogs(e)}
                            className="inline-flex py-1.5 px-2.5 bg-slate-100 hover:bg-slate-150 rounded-lg text-slate-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* LOG MODAL FOR SINGLE EVENT */}
        <Modal
          isOpen={!!selectedEventLogs}
          onClose={() => setSelectedEventLogs(null)}
          title="Rekap Riwayat Peserta"
        >
          {selectedEventLogs && (
            <div className="space-y-4 font-sans text-xs">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[9px] uppercase tracking-wide font-bold text-blue-600 font-mono bg-blue-50 py-0.5 px-2 rounded-md">{selectedEventLogs.id}</span>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight mt-1">{selectedEventLogs.nama}</h4>
                <p className="text-slate-400 font-medium mt-0.5">{selectedEventLogs.penyelenggara} &bull; {selectedEventLogs.tanggal}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Tabel Absensi ({selectedEventLogs.peserta?.length || 0} Terdaftar)</p>
                {selectedEventLogs.peserta?.length === 0 ? (
                  <p className="py-6 text-center text-slate-400 font-semibold bg-slate-50 border rounded-2xl">Belum ada peserta mendaftar.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-150 border border-slate-100 rounded-xl bg-white">
                    {selectedEventLogs.peserta.map((p, index) => (
                      <div key={p.nim} className="flex justify-between items-center p-2.5">
                        <div>
                          <p className="font-bold text-slate-800">{p.nama}</p>
                          <span className="text-[10px] text-slate-400 block">{p.nim}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          p.statusHadir === "hadir" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : p.statusHadir === "tidak hadir" 
                            ? "bg-red-50 text-red-800 border-red-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {p.statusHadir === "hadir" ? "Hadir" : p.statusHadir === "tidak hadir" ? "Alfa" : "Menunggu"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEventLogs(null)}
                className="w-full text-center bg-slate-900 hover:bg-black font-extrabold py-3 text-white rounded-xl cursor-pointer"
              >
                Tutup Rekap
              </button>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
