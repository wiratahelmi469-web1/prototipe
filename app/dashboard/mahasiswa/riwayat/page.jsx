// SECTION: Student History & Certified Logs Page
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Award, 
  Calendar, 
  QrCode, 
  Compass, 
  Layers, 
  History, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import TicketQRCode from "@/components/TicketQRCode";
import { generateCertificate } from "@/lib/generateCertificate";

export default function StudentHistoryCerts() {
  const router = useRouter();
  const { user } = useAuth();
  const { events } = useEvents();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "upcoming" | "past"
  const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);
  
  const mhsHistory = (user && events) ? events.filter((evt) =>
    evt.peserta?.some((p) => p.email.toLowerCase() === user.email.toLowerCase())
  ) : [];

  const getAttendanceState = (evt) => {
    const student = evt.peserta?.find((p) => p.email.toLowerCase() === user?.email?.toLowerCase());
    return student ? student.statusHadir : "menunggu";
  };

  // Safe checks for tab filters
  const upcomingEvents = mhsHistory.filter(
    (evt) => evt.eventStatus === "buka" || evt.eventStatus === "segera"
  );
  
  const completedEvents = mhsHistory.filter(
    (evt) => evt.eventStatus === "selesai" || evt.eventStatus === "tutup"
  );

  const displayList = 
    activeTab === "upcoming" 
      ? upcomingEvents 
      : activeTab === "past" 
      ? completedEvents 
      : mhsHistory;

  const handleDownloadCert = (evt) => {
    try {
      const student = evt.peserta?.find((p) => p.email.toLowerCase() === user.email.toLowerCase());
      if (!student) return;

      generateCertificate(evt, user, student.nomorSertifikat);
      showToast(`Sertifikat "${evt.nama}" berhasil diunduh! 🎓`, "success");
    } catch (error) {
      console.error("Failed to compile PDF:", error);
      showToast("Gagal menerbitkan PDF sertifikat.", "error");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["mahasiswa"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="student-history-certs-root">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Riwayat Kegiatan & Sertifikat saya
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
            Monitoring kehadiran presensi Anda, lihat QRCode tiket masuk, serta download sertifikat keikutsertaan disini.
          </p>
        </div>

        {/* TABS SELECTIVITY NAVIGATION */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:w-fit font-semibold text-xs border border-slate-50">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Semua Riwayat
          </button>
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === "upcoming" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Akan Datang
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all cursor-pointer ${
              activeTab === "past" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
            id="tab-history-past"
          >
            <History className="w-3.5 h-3.5" />
            Sudah Selesai
          </button>
        </div>

        {/* HISTORIES RESULTS VIEWS */}
        {displayList.length === 0 ? (
          <EmptyState
            judul="Riwayat Riwayat Kosong"
            deskripsi="Belum ada agenda terdaftar dalam kategori saringan terpilih ini."
            ikon={History}
            tombolLabel="Jelajahi Agenda Kampus"
            onTombolClick={() => router.push("/dashboard/mahasiswa/events")}
          />
        ) : (
          <div className="space-y-4">
            {displayList.map((evt) => {
              const kehadiran = getAttendanceState(evt);
              const isCertTersedia = kehadiran === "hadir" && evt.sertifikatStatus === "approved";

              // Color configs
              const hadirTags = {
                hadir: "bg-emerald-50 text-emerald-700 border-emerald-100",
                "tidak hadir": "bg-red-50 text-red-700 border-red-100",
                menunggu: "bg-slate-50 text-slate-500 border-slate-150",
              };

              const certTags = {
                approved: "bg-blue-50 text-blue-700 border-blue-100",
                pending: "bg-amber-50 text-amber-700 border-amber-100",
                rejected: "bg-red-50 text-red-700 border-red-100",
              };

              return (
                <div 
                  key={evt.id}
                  id={`history-row-${evt.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all duration-200"
                >
                  {/* Left info area */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-bold text-[#1a56db] tracking-wide">{evt.kategori} &bull; ID: {evt.id}</span>
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base mt-0.5 leading-snug truncate max-w-lg">
                      {evt.nama}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      {evt.tanggal} &bull; {evt.lokasi}
                    </p>

                    {/* Stats badges inside mobile layout */}
                    <div className="flex flex-wrap items-center gap-2 mt-3.5">
                      {/* Kehadiran Badge */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-md ${hadirTags[kehadiran]}`}>
                        PRESERSI: {kehadiran === "hadir" ? "HADIR" : kehadiran === "tidak hadir" ? "ALFA" : "VERIFIKASI"}
                      </span>

                      {/* Sertifikat Status Badge */}
                      {evt.eventStatus === "selesai" && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-md ${
                          evt.sertifikatStatus ? certTags[evt.sertifikatStatus] : "bg-slate-50 text-slate-500 border-slate-150"
                        }`}>
                          SERTIFIKAT: {evt.sertifikatStatus === "approved" ? "TERSEDIA" : evt.sertifikatStatus === "pending" ? "SEDANG DIAJUKAN" : "BELUM RILIS"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right actions trigger buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0 w-full md:w-auto">
                    {/* View Ticket QR */}
                    <button
                      onClick={() => setSelectedTicketEvent(evt)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 border border-slate-250 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors"
                      id={`btn-ticket-${evt.id}`}
                    >
                      <QrCode className="w-4 h-4 text-slate-400" />
                      Tiket QR
                    </button>

                    {/* Download Cert */}
                    {isCertTersedia ? (
                      <button
                        onClick={() => handleDownloadCert(evt)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4.5 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
                        id={`btn-download-cert-${evt.id}`}
                      >
                        <Award className="w-4 h-4 text-[#f59e0b] shrink-0" />
                        Unduh Sertifikat PDF
                      </button>
                    ) : (
                      /* Disabled states details indicator */
                      kehadiran === "hadir" && evt.sertifikatStatus !== "approved" ? (
                        <span className="flex-1 sm:flex-initial inline-flex items-center justify-center text-[10.5px] text-slate-400 border border-slate-100 bg-slate-50/50 py-2.5 px-4 rounded-xl cursor-not-allowed italic font-medium">
                          Sertifikat Pending Approval
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TICKET QR MODAL popup */}
        <Modal
          isOpen={!!selectedTicketEvent}
          onClose={() => setSelectedTicketEvent(null)}
          title="Kredit Masuk Tiket QR Anda"
        >
          {selectedTicketEvent && (
            <div className="flex flex-col items-center max-w-sm mx-auto">
              <TicketQRCode
                eventId={selectedTicketEvent.id}
                eventNama={selectedTicketEvent.nama}
                eventTanggal={selectedTicketEvent.tanggal}
                eventLokasi={selectedTicketEvent.lokasi}
              />
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
