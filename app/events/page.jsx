// SECTION: Public Event Catalogue Page
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  ArrowLeft,
  Users,
  GraduationCap
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import EventCard from "@/components/EventCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import Navbar from "@/components/Navbar";

export default function PublicEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, rsvpEvent } = useEvents();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tahunFilter, setTahunFilter] = useState("2026");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // RSVP Modal state
  const [selectedEventRsvp, setSelectedEventRsvp] = useState(null);
  const [confirmRsvpOpen, setConfirmRsvpOpen] = useState(false);

  useEffect(() => {
    // Simulate initial mounting load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const categories = ["All", "Seminar", "Workshop", "Lomba", "Sosial", "Olahraga", "Budaya", "Lainnya"];
  const statuses = ["All", "Buka", "Segera", "Selesai", "Tutup"];

  // Filter events based on selections
  // Only show APPROVED events on public catalogue
  const publicEvents = events.filter((evt) => evt.status === "approved");

  const filteredEvents = publicEvents.filter((evt) => {
    // Search matching
    const matchesSearch = evt.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          evt.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Kategori matching
    const matchesKategori = kategoriFilter === "All" || evt.kategori === kategoriFilter;

    // Status matching
    const matchesStatus = statusFilter === "All" || evt.eventStatus?.toLowerCase() === statusFilter.toLowerCase();

    // Tahun matching
    const matchesTahun = !tahunFilter || evt.tanggal.includes(tahunFilter);

    return matchesSearch && matchesKategori && matchesStatus && matchesTahun;
  });

  const handleRsvpInitiate = (event) => {
    if (!user || user.role === "guest") {
      showToast("Silakan login dengan akun Anda untuk melakukan RSVP event ini.", "warning");
      router.push("/login");
      return;
    }
    
    setSelectedEventRsvp(event);
    setConfirmRsvpOpen(true);
  };

  const handleConfirmRsvpSubmit = () => {
    if (!selectedEventRsvp || !user) return;

    const res = rsvpEvent(selectedEventRsvp.id, user);
    setConfirmRsvpOpen(false);

    if (res.success) {
      showToast("RSVP berhasil! Sampai berjumpa di event nanti 🎉", "success");
      // Direct user to histories page
      router.push("/dashboard/mahasiswa/riwayat");
    } else {
      showToast(res.error, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-between" id="public-events-catalogue-root">
      
      {/* Dynamic top bar navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
            id="back-home-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-[#1a56db] p-1.5 rounded-lg text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-[#1a56db] text-md hidden sm:block">EventHub Kampus</h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {user ? (
            <button
              onClick={() => router.push(`/dashboard/${user.role}`)}
              className="bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all"
              id="catalogue-dashboard-link"
            >
              Dashboard Saya
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all"
              id="catalogue-login-link"
            >
              Masuk Platform
            </button>
          )}
        </div>
      </nav>

      <div className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Header Title */}
        <div className="mb-8 text-center sm:text-left select-none">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
            Papan Event Kampus
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl font-medium leading-relaxed">
            Temukan agenda diskusi, seminar nasional, kompetisi, dan workshop pengembangan karir terkini garapan mahasiswa Universitas Nurul Fikri.
          </p>
        </div>

        {/* SEARCH AND FILTERS CONTROL AREA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul event atau penyelenggara kepanitiaan..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-3 pl-10 pr-4 rounded-xl outline-none transition-all"
                id="inp-search-events"
              />
            </div>

            {/* Mobile Filter Toggler */}
            <button
              onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              className="sm:hidden flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 py-3 rounded-xl text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              id="btn-toggle-filters"
            >
              <Filter className="w-4 h-4 text-[#1a56db]" />
              Saring Pencarian
              {filterDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* FILTERS PANEL: INLINE ON DESKTOP / DRAWER ON MOBILE */}
          <div className={`sm:block ${filterDrawerOpen ? "block" : "hidden"} pt-2 sm:pt-0`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold">
              {/* Category selector */}
              <div className="space-y-1.5Col">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
                  Kategori
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 sm:max-h-none overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setKategoriFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        kategoriFilter === cat
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-250 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selectors */}
              <div className="space-y-1.5 col-span-1">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
                  Status Registrasi
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((stat) => (
                    <button
                      key={stat}
                      onClick={() => setStatusFilter(stat)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        statusFilter === stat
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white text-slate-600 border-slate-250 hover:bg-slate-50 hover:border-slate-350"
                      }`}
                    >
                      {stat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year selectivity selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">
                  Tahun Acara
                </span>
                <div className="flex gap-1.5">
                  {["2026", "2025"].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setTahunFilter(tahunFilter === yr ? "" : yr)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        tahunFilter === yr
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-250 hover:bg-slate-50 hover:border-slate-350"
                      }`}
                    >
                      Tahun {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING SHADOWS */}
        {loading ? (
          <LoadingSkeleton type="cardGrid" count={6} />
        ) : filteredEvents.length === 0 ? (
          /* EMPTY RECORDS COMPONENT */
          <EmptyState
            judul="Event Tidak Ditemukan"
            deskripsi="Tidak ada agenda yang cocok dengan kata kunci pencarian atau penyaringan filter terpilih."
            onTombolClick={() => {
              setSearchTerm("");
              setKategoriFilter("All");
              setStatusFilter("All");
              setTahunFilter("2026");
            }}
            tombolLabel="Reset Pencarian"
          />
        ) : (
          /* EVENT GRID CATALOGUE */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="public-events-list">
            {filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                currentUser={user}
                onRsvpClick={handleRsvpInitiate}
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER DESKRIPSI */}
      <footer className="text-center text-slate-400 border-t border-slate-200 py-6 mt-12 bg-white text-xs select-none">
        Portal EventHub Kampus &copy; STT Terpadu Nurul Fikri 2026. Semua hak dilindungi.
      </footer>

      {/* RSVP CONFIRMATION DIALOG MODAL */}
      <Modal
        isOpen={confirmRsvpOpen}
        onClose={() => setConfirmRsvpOpen(false)}
        title="Konfirmasi RSVP Pendaftaran"
      >
        {selectedEventRsvp && (
          <div className="space-y-4 font-sans text-slate-700">
            <div className="p-4 bg-blue-50 text-blue-900 border border-blue-150 rounded-2xl flex flex-col gap-2">
              <span className="font-bold text-xs uppercase tracking-wide text-blue-800">
                Data Pendaftar (Akun Anda)
              </span>
              <div className="grid grid-cols-2 text-xs gap-1 opacity-90 font-medium">
                <span>Nama Lengkap:</span>
                <span className="font-bold text-slate-900">{user?.nama}</span>
                <span>NIM/NIP:</span>
                <span className="font-bold text-slate-900">{user?.nimNip || "GUEST"}</span>
                <span>Email Institusi:</span>
                <span className="font-bold text-slate-900 truncate">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                {selectedEventRsvp.nama}
              </h4>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100">
                <Calendar className="w-4 h-4 text-[#1a56db]" />
                <span>{selectedEventRsvp.tanggal} &bull; {selectedEventRsvp.jam}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              * Dengan mendaftar, Anda menyatakan bersedia hadir tepat waktu di lokasi acara. Tiket presensi QR-code pribadi Anda akan diterbitkan secara otomatis setelah proses konfirmasi selesai.
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-3">
              <button
                onClick={() => setConfirmRsvpOpen(false)}
                className="font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 px-4 rounded-xl cursor-pointer transition-colors text-center"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRsvpSubmit}
                className="font-bold text-xs bg-[#1a56db] hover:bg-blue-700 text-white py-3 px-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] shadow-sm text-center"
                id="btn-confirm-rsvp-yes"
              >
                Ya, Daftarkan Saya
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
