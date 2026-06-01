// SECTION: Staff Event Directory Monitoring Console
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Users, Calendar, MapPin, CheckSquare, Settings, Award } from "lucide-react";
import useEvents from "@/hooks/useEvents";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import useToast from "@/hooks/useToast";

export default function StaffEventsRegister() {
  const router = useRouter();
  const { events, updateEventStatus } = useEvents();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogsEvent, setSelectedLogsEvent] = useState(null);
  
  // Custom quota adjuster state
  const [quotaTargetEvt, setQuotaTargetEvt] = useState(null);
  const [newQuotaVal, setNewQuotaVal] = useState(100);

  const filtered = events.filter((e) =>
    e.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdjustQuotaSubmit = (e) => {
    e.preventDefault();
    if (!quotaTargetEvt) return;

    if (newQuotaVal < quotaTargetEvt.kuotaTerisi) {
      showToast(`Kuota tidak boleh kurang dari kapasitas yang terisi (${quotaTargetEvt.kuotaTerisi} mendaftar).`, "error");
      return;
    }

    // Match and adjust
    const matchingEvents = JSON.parse(localStorage.getItem("events") || "[]");
    const updated = matchingEvents.map((item) => {
      if (item.id === quotaTargetEvt.id) {
        return { ...item, kuotaMax: Number(newQuotaVal) };
      }
      return item;
    });

    localStorage.setItem("events", JSON.stringify(updated));
    // Trigger update-event refresh call
    window.dispatchEvent(new Event("events-updated"));
    setQuotaTargetEvt(null);
    showToast("Kuota pendaftaran sukses disesuaikan! 📊", "success");
  };

  return (
    <ProtectedRoute allowedRoles={["staf"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="staff-events-directory-root">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Daftar Agenda Kegiatan & Prestasi
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
              Sebagai Staf Kemahasiswaan, Anda dapat memantau kuota, melihat kehadiran, serta memodifikasi kendali teknis administratif.
            </p>
          </div>
        </div>

        {/* SEARCH CONTROLS */}
        <div className="bg-white border rounded-2xl border-slate-200 p-4 shadow-xs flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul kegiatan atau penyelanggara..."
              className="w-full bg-slate-50 border border-slate-250 hover:border-slate-300 focus:border-[#1a56db] focus:bg-white text-slate-800 text-xs py-2.5 pl-10 pr-4 rounded-xl outline-none transition-all"
            />
          </div>
        </div>

        {/* RESULTS TABLE */}
        {filtered.length === 0 ? (
          <EmptyState
            judul="Pencarian Tidak Ditemukan"
            deskripsi="Tidak ada agenda yang cocok dengan kata kunci."
            ikon={Search}
          />
        ) : (
          <div className="bg-white border rounded-3xl border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-2">Event</th>
                    <th className="pb-3 px-2">Kategori</th>
                    <th className="pb-3 px-2">Penyelenggara</th>
                    <th className="pb-3 px-2">Kuota/Pendaftar</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 pl-2 text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filtered.map((e) => {
                    const statusTag = {
                      approved: "text-emerald-700 bg-emerald-50 border-emerald-100",
                      pending_approval: "text-amber-700 bg-amber-50 border-amber-100",
                      rejected: "text-red-700 bg-red-50 border-red-100"
                    };

                    return (
                      <tr key={e.id} id={`staff-evt-row-${e.id}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-2">
                          <p className="font-bold text-slate-950 truncate max-w-[180px]">{e.nama}</p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{e.tanggal}</span>
                        </td>
                        <td className="py-4 px-2 whitespace-nowrap">{e.kategori}</td>
                        <td className="py-4 px-2 truncate max-w-[140px]" title={e.penyelenggara}>{e.penyelenggara}</td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          <span className="font-bold text-slate-950">{e.kuotaTerisi}</span> / {e.kuotaMax}
                        </td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 border rounded-lg ${statusTag[e.status]}`}>
                            {e.status === "approved" ? "Aktif" : e.status === "pending_approval" ? "Review" : "Ditolak"}
                          </span>
                        </td>
                        <td className="py-4 pl-2 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1.5 pl-2 items-center justify-end">
                            {/* Rekap logs button */}
                            <button
                              onClick={() => setSelectedLogsEvent(e)}
                              className="border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[10px] py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors"
                              title="Lihat Daftar Peserta"
                            >
                              <Users className="w-3.5 h-3.5 shrink-0" />
                            </button>

                            {/* Adjust Quotas button */}
                            {e.status === "approved" && (
                              <button
                                onClick={() => {
                                  setQuotaTargetEvt(e);
                                  setNewQuotaVal(e.kuotaMax);
                                }}
                                className="border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] py-1.5 px-2.5 rounded-lg cursor-pointer transition-colors"
                                title="Atur Kuota"
                              >
                                <Settings className="w-3.5 h-3.5 shrink-0" />
                              </button>
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

        {/* MODAL 1: EVENT RECAP RECORD TABLE */}
        <Modal
          isOpen={!!selectedLogsEvent}
          onClose={() => setSelectedLogsEvent(null)}
          title="Rekap Rincian Peserta"
        >
          {selectedLogsEvent && (
            <div className="space-y-4 font-sans text-xs">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-[9px] uppercase tracking-wide font-bold text-blue-600 font-mono bg-blue-50 py-0.5 px-2 rounded-md">{selectedLogsEvent.id}</span>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight mt-1">{selectedLogsEvent.nama}</h4>
                <p className="text-slate-400 font-medium mt-0.5">{selectedLogsEvent.penyelenggara} &bull; {selectedLogsEvent.tanggal}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-2">Tabel Absensi ({selectedLogsEvent.peserta?.length || 0} Terdaftar)</p>
                {selectedLogsEvent.peserta?.length === 0 ? (
                  <p className="py-6 text-center text-slate-400 font-semibold bg-slate-50 border border-dashed rounded-2xl">Belum ada mahasiswa mendaftar.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-150 border border-slate-100 rounded-xl bg-white mb-2">
                    {selectedLogsEvent.peserta.map((p) => (
                      <div key={p.nim} className="flex justify-between items-center p-2.5">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 truncate">{p.nama}</p>
                          <span className="text-[10px] text-slate-400 font-bold font-mono">{p.nim} &bull; {p.email}</span>
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
                onClick={() => setSelectedLogsEvent(null)}
                className="w-full text-center bg-slate-900 hover:bg-black font-extrabold py-3 text-white rounded-xl cursor-pointer"
              >
                Tutup Rekap
              </button>
            </div>
          )}
        </Modal>

        {/* MODAL 2: ADJUST QUOTAS VALUE OPTIONS */}
        <Modal
          isOpen={!!quotaTargetEvt}
          onClose={() => setQuotaTargetEvt(null)}
          title="Atur Kuota Pendaftaran"
        >
          {quotaTargetEvt && (
            <form onSubmit={handleAdjustQuotaSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <h4 className="font-bold text-slate-800 leading-tight">{quotaTargetEvt.nama}</h4>
                <p className="text-slate-400 font-medium mt-0.5">Sudah Terisi (Mendaftar): <strong className="text-slate-700">{quotaTargetEvt.kuotaTerisi}</strong> Kursi</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-adjust-quota" className="font-bold text-slate-700 block">Kapasitas Maksimal Baru</label>
                <input
                  id="form-adjust-quota"
                  type="number"
                  required
                  value={newQuotaVal}
                  onChange={(e) => setNewQuotaVal(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 p-3 rounded-xl text-slate-800 text-sm font-bold font-mono"
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setQuotaTargetEvt(null)}
                  className="py-3 px-4 font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-3 px-4 font-bold bg-[#1a56db] hover:bg-blue-700 text-white rounded-xl cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
