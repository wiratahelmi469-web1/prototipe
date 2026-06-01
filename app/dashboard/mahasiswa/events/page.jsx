// SECTION: Student Events List & Tracking Page
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Award, Layers, CheckCircle2, Search, Compass } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import EventCard from "@/components/EventCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";

export default function StudentEventsRegistry() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, rsvpEvent } = useEvents();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "rsvp"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Filter lists based on tab
  const approvedEvents = events.filter((e) => e.status === "approved");

  const myRsvpEvents = approvedEvents.filter((evt) =>
    evt.peserta?.some((p) => p.email.toLowerCase() === user?.email?.toLowerCase())
  );

  const displayList = activeTab === "all" ? approvedEvents : myRsvpEvents;

  // Search matching
  const filteredDisplay = displayList.filter((e) =>
    e.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRsvpInitiate = (event) => {
    setSelectedEvent(event);
    setConfirmModalOpen(true);
  };

  const handleRsvpConfirmSubmit = () => {
    if (!selectedEvent || !user) return;
    const res = rsvpEvent(selectedEvent.id, user);
    setConfirmModalOpen(false);

    if (res.success) {
      showToast("RSVP Berhasil! Tiket Anda sudah diterbitkan di menu riwayat. 🎉", "success");
    } else {
      showToast(res.error, "error");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["mahasiswa"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="student-events-registry-root">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Daftar Agenda Kegiatan
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
              Daftari segenap seminar kepanitiaan penunjang nilai SKK Kemahasiswaan Anda.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
            className="inline-flex items-center gap-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1a56db] font-bold text-xs py-2.5 px-4.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            id="shorthand-btn-riwayat"
          >
            <Award className="w-4 h-4 text-blue-600 shrink-0" />
            Riwayat & Sertifikat Saya &rarr;
          </button>
        </div>

        {/* SEARCH AND TAB RIDERS */}
        <div className="bg-white border rounded-2xl border-slate-200 p-4 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 font-bold text-xs py-2 px-4.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "all" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Semua Event
            </button>
            <button
              onClick={() => setActiveTab("rsvp")}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2 font-bold text-xs py-2 px-4.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "rsvp" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              id="tab-student-rsvp"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Event Saya (RSVP)
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kata kunci..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#1a56db] focus:bg-white text-slate-800 text-xs py-2.5 pl-10 pr-4 rounded-xl outline-none transition-all"
            />
          </div>
        </div>

        {/* DISPLAY GRID CARDS */}
        {filteredDisplay.length === 0 ? (
          <EmptyState
            judul={activeTab === "all" ? "Tidak Ada Event" : "Anda Belum RSVP"}
            deskripsi={
              activeTab === "all" 
                ? "Tidak ada data event aktif yang dapat diikuti saat ini." 
                : "Anda belum mendaftarkan diri pada agenda event mana pun."
            }
            ikon={activeTab === "all" ? Compass : CheckCircle2}
            tombolLabel={activeTab === "rsvp" ? "Cari Event Sekarang" : null}
            onTombolClick={activeTab === "rsvp" ? () => setActiveTab("all") : null}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDisplay.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                currentUser={user}
                onRsvpClick={handleRsvpInitiate}
              />
            ))}
          </div>
        )}

        {/* RSVP CONFIRMATION DIALOG MODAL */}
        <Modal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="Konfirmasi RSVP Pendaftaran"
        >
          {selectedEvent && (
            <div className="space-y-4 font-sans text-xs text-slate-700">
              <p className="leading-relaxed">Apakah Anda yakin ingin mendaftarkan keikutsertaan Anda di agenda <strong className="text-slate-900">{selectedEvent.nama}</strong>?</p>
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="py-3 px-4 font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRsvpConfirmSubmit}
                  className="py-3 px-4 font-bold bg-[#1a56db] hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-colors"
                  id="confirm-rsvp-inner-yes"
                >
                  Ya, Daftarkan &rarr;
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
