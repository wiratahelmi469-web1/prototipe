"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Workspace from "../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../lib/mockData";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  Filter, 
  Search, 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  X, 
  ChevronRight, 
  Bookmark, 
  QrCode, 
  Download, 
  Smartphone,
  GraduationCap,
  Building,
  Check,
  Flame,
  Globe,
  Tag
} from "lucide-react";
import { formatDate } from "../../lib/utils";
import Toast, { ToastContainer } from "../../components/Toast";

export default function PublicEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Detailed Modal Overlay State
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  
  // Registration Form Sheet State
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerEvent, setRegisterEvent] = useState<EventItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formNim, setFormNim] = useState("");
  const [formProdi, setFormProdi] = useState("Teknik Informatika");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formAgreed, setFormAgreed] = useState(false);
  
  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Confirmation State
  const [successTicket, setSuccessTicket] = useState<{
    ticketCode: string;
    name: string;
    eventName: string;
    date: string;
    location: string;
  } | null>(null);

  // Load events from LocalStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("eventhub_events");
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) {
        setEvents(INITIAL_EVENTS);
      }
    } else {
      localStorage.setItem("eventhub_events", JSON.stringify(INITIAL_EVENTS));
      setEvents(INITIAL_EVENTS);
    }
  }, []);

  // Sync logged in user data to registration form
  useEffect(() => {
    if (user?.isLoggedIn) {
      setFormName(user.name || "");
      setFormEmail(user.email || "");
      // Retrieve NIM from stored profile if exists
      const savedProfile = localStorage.getItem(`eventhub_profile_${user.email}`);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.nim_nip) setFormNim(parsed.nim_nip);
          if (parsed.phone) setFormPhone(parsed.phone);
          if (parsed.faculty) setFormProdi(parsed.faculty);
        } catch (e) {}
      }
    }
  }, [user]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const categories = ["Semua", "Seminar", "Workshop", "Lomba", "Webinar", "Sosial"];

  // Category gradients mapping
  const getGradientForCategory = (category: string) => {
    switch (category) {
      case "Seminar":
        return "from-[#0F1E3C] via-[#1a315e] to-indigo-950";
      case "Workshop":
        return "from-[#0d3326] via-[#114030] to-emerald-950";
      case "Lomba":
        return "from-[#4a3411] via-[#634517] to-stone-900";
      case "Webinar":
        return "from-[#2f1b4d] via-[#3f2468] to-purple-950";
      case "Sosial":
        return "from-[#4c151b] via-[#661d24] to-zinc-900";
      default:
        return "from-slate-900 via-indigo-950 to-stone-900";
    }
  };

  const getQuotaForEvent = (event: EventItem) => {
    const title = event.title.toLowerCase();
    if (title.includes("seminar")) return 200;
    if (title.includes("ui/ux") || title.includes("design") || title.includes("pelatihan") || title.includes("speaking")) return 100;
    if (title.includes("lomba") || title.includes("kompetisi")) return 150;
    if (title.includes("kewirausahaan") || title.includes("webinar")) return 500;
    if (title.includes("sosial") || title.includes("donor")) return 80;
    return 150; // default quota fallback
  };

  // Filter events based on search query & selected category filter
  const filteredEvents = events.filter((evt) => {
    const matchesCategory = categoryFilter === "Semua" || evt.category === categoryFilter;
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetail = (evt: EventItem) => {
    setSelectedEvent(evt);
  };

  const handleOpenRegister = (evt: EventItem) => {
    if (evt.status === "Tutup" || evt.pesertaCount >= getQuotaForEvent(evt)) {
      addToast("Mohon maaf, pendaftaran untuk event ini telah ditutup/penuh.", "error");
      return;
    }
    setRegisterEvent(evt);
    setIsRegistering(true);
    setSelectedEvent(null); // Close detail modal if opened
    setFormErrors({});
  };

  // Standard regex-based form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = "Nama lengkap wajib diisi";
    if (!formNim.trim()) errors.nim = "NIM/Nomor identitas wajib diisi";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formEmail.trim()) {
      errors.email = "Email aktif wajib diisi";
    } else if (!emailRegex.test(formEmail)) {
      errors.email = "Format email tidak valid (contoh: user@gmail.com)";
    }

    const phoneRegex = /^08[0-9]{8,11}$/;
    if (!formPhone.trim()) {
      errors.phone = "Nomor WhatsApp aktif wajib diisi";
    } else if (!phoneRegex.test(formPhone)) {
      errors.phone = "Format nomor HP salah (Wajib diawali 08, minimal 10 digit)";
    }

    if (!formAgreed) {
      errors.agreed = "Anda harus menyetujui syarat & ketentuan";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEvent) return;

    if (!validateForm()) {
      addToast("Harap periksa isian formulir yang salah.", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      // 1. Generate unique ticket code
      const randHex = Math.floor(1000 + Math.random() * 9000);
      const categorySlug = registerEvent.category.substring(0, 3).toUpperCase();
      const ticketCode = `EH-${categorySlug}-${randHex}`;

      // 2. Decrement or modify real registration in app registry
      const updatedEvents = events.map((evt) => {
        if (evt.id === registerEvent.id) {
          const quotaVal = getQuotaForEvent(evt);
          const newCount = Math.min(quotaVal, evt.pesertaCount + 1);
          return {
            ...evt,
            pesertaCount: newCount,
            status: newCount >= quotaVal ? "Tutup" as const : evt.status
          };
        }
        return evt;
      });

      localStorage.setItem("eventhub_events", JSON.stringify(updatedEvents));
      setEvents(updatedEvents);

      // Save user registrations logically in browser
      const userRegKey = `registered_${formEmail.trim()}_events`;
      let userRegs: string[] = [];
      try {
        const exist = localStorage.getItem(userRegKey);
        if (exist) userRegs = JSON.parse(exist);
      } catch (e) {}

      if (!userRegs.includes(registerEvent.id)) {
        userRegs.push(registerEvent.id);
        localStorage.setItem(userRegKey, JSON.stringify(userRegs));
      }

      // Check in to registered database index for staff view tracking
      const savedRegUsers = localStorage.getItem("eventhub_registered_users");
      let currentRegUsers: any[] = [];
      if (savedRegUsers) {
        try {
          currentRegUsers = JSON.parse(savedRegUsers);
        } catch (e) {}
      }

      // Add student registration record for staff dashboard tracking
      const isRecordExists = currentRegUsers.some(
        (u) => u.email === formEmail.trim() && u.eventId === registerEvent.id
      );

      if (!isRecordExists) {
        currentRegUsers.push({
          id: `reg_${Date.now()}`,
          name: formName.trim(),
          email: formEmail.trim(),
          nim: formNim.trim(),
          prodi: formProdi,
          phone: formPhone.trim(),
          eventId: registerEvent.id,
          eventTitle: registerEvent.title,
          isPresent: false, // For staff manual or QR ticketing Check-in
          dateRegistered: new Date().toISOString(),
          ticketCode
        });
        localStorage.setItem("eventhub_registered_users", JSON.stringify(currentRegUsers));
      }

      // Show success modal configuration
      setSuccessTicket({
        ticketCode,
        name: formName.trim(),
        eventName: registerEvent.title,
        date: registerEvent.date,
        location: registerEvent.location,
      });

      addToast("Pendaftaran berhasil diproses!", "success");
      setIsSubmitting(false);
      setIsRegistering(false);
    }, 1200);
  };

  const handleDownloadTicket = () => {
    if (!successTicket) return;
    
    // Generates a mock virtual offline printer download
    const element = document.createElement("a");
    const ticketText = `
=============================================
         TICKET ELEKTRONIK EVENT-HUB         
       UNIVERSITAS NURUL FIKRI - 2026        
=============================================
KODE TICKET : ${successTicket.ticketCode}
NAMA        : ${successTicket.name}
EVENT       : ${successTicket.eventName}
TANGGAL     : ${formatDate(successTicket.date)}
LOKASI      : ${successTicket.location}
=============================================
* Bawa bukti tiket ini saat registrasi offline
* Scan barcode tiket untuk pencetakan e-sertifikat
    `;
    const file = new Blob([ticketText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Tiket-${successTicket.ticketCode}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast("Berkas tiket digital berhasil diunduh!", "info");
  };

  return (
    <Workspace id="public_events_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-6xl mx-auto space-y-12" id="refined_public_events_view">
        
        {/* SECTION 2: HERO BANNER (Navy & Gold Gradient Layout) */}
        <div 
          className="relative bg-[#0F1E3C] border border-[#1a315e] rounded-3xl p-8 md:p-14 text-white overflow-hidden shadow-xl"
          id="events_public_hero_section"
        >
          {/* Subtle noise grid pattern background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5A623]/10 rounded-full filter blur-3xl opacity-30 pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-500/10 rounded-full filter blur-3xl opacity-20 pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest bg-[#F5A623]/25 text-[#F5A623] px-3.5 py-1 rounded-full border border-[#F5A623]/40">
              <Sparkles className="w-4 h-4 fill-[#F5A623]" />
              UNIVERSITAS NURUL FIKRI · KALENDER KEMAHASISWAAN 2026
            </span>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Temukan &amp; Ikuti <span className="text-[#F5A623]">Event Kampus</span> Terbaik
            </h2>
            
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-xl font-medium">
              Registrasi instan menggunakan NIM, verifikasi presensi elektronik instan, kumpulkan kredit SKKM, dan generate e-sertifikat berpenandatangan digital resmi dewan kampus.
            </p>

            {/* Powerful Multi-Action Search & Query Container */}
            <div className="pt-2 max-w-2xl">
              <div className="relative flex items-center bg-white/95 text-stone-800 rounded-2xl p-1.5 shadow-lg border border-stone-150">
                <Search className="absolute left-4.5 w-4.5 h-4.5 text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Cari nama event, penyelenggara, lokasi atau kata kunci..."
                  className="w-full text-xs font-semibold pl-12 pr-4 py-3 bg-transparent border-none outline-hidden focus:ring-0 text-stone-850 placeholder-stone-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Styled Category Filter Chips Container */}
              <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-stone-300">
                <span className="text-[10px] font-black uppercase text-[#F5A623] tracking-widest mr-2 shrink-0 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  KATEGORI:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-[10px] font-extrabold rounded-lg shrink-0 transition-all uppercase tracking-wider cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-[#F5A623] text-[#0F1E3C] shadow-md font-black"
                        : "bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: QUICK STATS HIGHLIGHTS BAR */}
        <div 
          className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm divide-y md:divide-y-0 md:divide-x divide-stone-100 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0"
          id="events_quick_stats_segment"
        >
          <div className="text-center md:px-4 py-2 flex flex-col justify-center items-center">
            <div className="inline-flex p-2 bg-[#F5A623]/10 text-[#F5A623] rounded-xl mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-2xl md:text-3xl font-black text-[#0F1E3C] tracking-tight font-mono">48+ Agenda</span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Selesai Terlaksana</span>
          </div>

          <div className="text-center md:px-4 py-2 flex flex-col justify-center items-center">
            <div className="inline-flex p-2 bg-sky-500/10 text-sky-600 rounded-xl mb-2">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl md:text-3xl font-black text-[#0F1E3C] tracking-tight font-mono">2.300+</span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Mahasiswa Terdaftar</span>
          </div>

          <div className="text-center md:px-4 py-2 flex flex-col justify-center items-center">
            <div className="inline-flex p-2 bg-emerald-50 text-emerald-600 rounded-xl mb-2">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-2xl md:text-3xl font-black text-[#0F1E3C] tracking-tight font-mono">100% Digital</span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">E-Sertifikat Terbit</span>
          </div>
        </div>

        {/* SECTION 4: EVENTS CARDS GRID MAIN DISCOVERY */}
        <div className="space-y-6" id="public_events_grid_container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
            <div>
              <h3 className="text-lg font-black text-[#0F1E3C] uppercase tracking-tight">Katalog Kegiatan Kampus</h3>
              <p className="text-xs text-stone-500 mt-1">Daftar agenda aktif kemahasiswaan, silakan pilih event untuk informasi detail.</p>
            </div>
            <div className="text-xs font-bold text-stone-400 font-mono">
              Menampilkan {filteredEvents.length} Event
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="py-20 text-center bg-white border border-stone-200 rounded-3xl shadow-sm space-y-3">
              <HelpCircle className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-700">Agenda Tidak Ditemukan</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Kami tidak menemukan agenda aktif dengan kriteria "{searchQuery || categoryFilter}". Silakan periksa filter atau kata kunci lainnya.
              </p>
              <button 
                onClick={() => { setSearchQuery(""); setCategoryFilter("Semua"); }}
                className="mt-2 text-xs font-bold px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => {
                const quotaVal = getQuotaForEvent(evt);
                const filledRatio = Math.min(100, Math.floor((evt.pesertaCount / quotaVal) * 100));
                
                // Determine banner style
                const gradientClass = getGradientForCategory(evt.category);
                
                return (
                  <div 
                    key={evt.id}
                    className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
                    id={`public_evt_card_${evt.id}`}
                  >
                    {/* Visual Card Banner Header */}
                    <div className={`h-40 bg-gradient-to-br ${gradientClass} relative p-5 flex flex-col justify-between text-white overflow-hidden`}>
                      {/* Ambient Grid Accent */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.5))] pointer-events-none" />
                      <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full filter blur-xl group-hover:scale-125 transition-transform" />
                      
                      {/* Badges row */}
                      <div className="flex justify-between items-start z-10">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-lg border border-white/20">
                          {evt.category}
                        </span>

                        <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-md tracking-wider flex items-center gap-1 ${
                          evt.status === "Buka Pendaftaran"
                            ? "bg-emerald-550/90 text-white backdrop-blur-xs border border-emerald-400" 
                            : evt.status === "Hampir Penuh"
                            ? "bg-[#F5A623] text-[#0F1E3C] font-black"
                            : "bg-stone-500/90 text-stone-100 border border-stone-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            evt.status === "Buka Pendaftaran" ? "bg-emerald-300 animate-pulse" : "bg-white"
                          }`} />
                          {evt.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Display Info within Banner */}
                      <div className="z-10 text-stone-200 text-[10px] font-mono tracking-wider font-bold mb-1 uppercase flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#F5A623]" />
                        {evt.organizer}
                      </div>
                    </div>

                    {/* Card Content Details Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-[#0F1E3C] text-sm group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                          {evt.title}
                        </h4>
                        
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {evt.description}
                        </p>
                      </div>

                      {/* Info specifications checklist */}
                      <div className="space-y-2 pt-3.5 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
                          <span>{formatDate(evt.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                          <span className="line-clamp-1">{evt.location}</span>
                        </div>
                        
                        {/* Interactive Quota progress info */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase">
                            <span>SISA KUOTA</span>
                            <span className="text-stone-700 font-mono">{evt.pesertaCount} / {getQuotaForEvent(evt)}</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                filledRatio >= 90 ? "bg-rose-500" : filledRatio >= 70 ? "bg-amber-500" : "bg-emerald-550"
                              }`}
                              style={{ width: `${filledRatio}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Button footer action triggers */}
                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex gap-2">
                      <button
                        onClick={() => handleOpenDetail(evt)}
                        className="flex-1 py-2.5 px-3 text-center bg-white border border-stone-200 hover:bg-stone-100 hover:border-stone-300 rounded-xl text-xs font-black text-[#0F1E3C] transition-all cursor-pointer"
                        id={`btn_detail_${evt.id}`}
                      >
                        Lihat Detail
                      </button>

                      <button
                        onClick={() => handleOpenRegister(evt)}
                        disabled={evt.status === "Tutup" || evt.pesertaCount >= getQuotaForEvent(evt)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          evt.status === "Tutup" || evt.pesertaCount >= getQuotaForEvent(evt)
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-200"
                            : "bg-[#0F1E3C] hover:bg-[#1a315e] text-white border border-[#0F1E3C] group-hover:text-[#F5A623]"
                        }`}
                        id={`btn_register_${evt.id}`}
                      >
                        Daftar
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 5: MODAL DETAIL EVENT (Interactive Lightbox overlay) */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 py-8 animate-fade-in" id="event_detail_lightbox">
            <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative block animate-scale-up">
              
              {/* Close Button tag */}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/50 hover:bg-stone-950 text-white z-20 cursor-pointer shadow-md transition-colors"
                id="close_evt_detail_lightbox_btn"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Graphic Banner Top */}
              <div className={`h-56 bg-gradient-to-br ${getGradientForCategory(selectedEvent.category)} relative flex flex-col justify-end p-6 md:p-8 text-white`}>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.7))] pointer-events-none" />
                <div className="space-y-2 relative z-10">
                  <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md rounded-md">
                    {selectedEvent.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight leading-snug">{selectedEvent.title}</h3>
                  <p className="text-xs text-stone-200 font-mono font-bold">Diselenggarakan oleh: {selectedEvent.organizer}</p>
                </div>
              </div>

              {/* Content Panel Grid */}
              <div className="p-6 md:p-8 space-y-6">
                
                {/* Deskripsi Lengkap */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">Deskripsi Kegiatan</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Detail Informasi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-4 border border-stone-150 rounded-2xl">
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-stone-400 tracking-wider uppercase border-b border-stone-200 pb-1">WAKTU &amp; LOKASI</h5>
                    
                    <div className="flex items-center gap-2.5 text-xs text-stone-700 font-bold">
                      <Calendar className="w-4.5 h-4.5 text-[#0F1E3C] shrink-0" />
                      <div>
                        <span className="block text-stone-400 text-[10px] font-medium leading-none">Tanggal</span>
                        <span>{formatDate(selectedEvent.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-stone-700 font-bold">
                      <Clock className="w-4.5 h-4.5 text-[#0F1E3C] shrink-0" />
                      <div>
                        <span className="block text-stone-400 text-[10px] font-medium leading-none">Waktu</span>
                        <span>{selectedEvent.time || "08.00 - Selesai WIB"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-stone-700 font-bold">
                      <MapPin className="w-4.5 h-4.5 text-[#0F1E3C] shrink-0" />
                      <div>
                        <span className="block text-stone-400 text-[10px] font-medium leading-none">Tempat</span>
                        <span className="line-clamp-1">{selectedEvent.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-stone-400 tracking-wider uppercase border-b border-stone-200 pb-1">KETENTUAN KUOTA</h5>
                    
                    <div className="flex items-center gap-2.5 text-xs text-stone-700 font-bold">
                      <Users className="w-4.5 h-4.5 text-[#0F1E3C] shrink-0" />
                      <div>
                        <span className="block text-stone-400 text-[10px] font-medium leading-none">Kapasitas Maksimal</span>
                        <span>{getQuotaForEvent(selectedEvent)} Orang</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-stone-700 font-bold">
                      <Bookmark className="w-4.5 h-4.5 text-[#0F1E3C] shrink-0" />
                      <div>
                        <span className="block text-stone-400 text-[10px] font-medium leading-none">Status</span>
                        <span className="text-emerald-650 capitalize font-extrabold">{selectedEvent.status}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-stone-700 font-bold">
                      <Globe className="w-4.5 h-4.5 text-[#0F1E3C] shrink-0" />
                      <div>
                        <span className="block text-stone-400 text-[10px] font-medium leading-none">Sistem Penyelenggaraan</span>
                        <span>{selectedEvent.location.toLowerCase().includes("zoom") || selectedEvent.location.toLowerCase().includes("online") ? "Daring (Online)" : "Luring (Offline)"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footnote & Action triggers */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-end border-t border-stone-100">
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer transition"
                    id="close_evt_detail_model_btn"
                  >
                    Batal Kembali
                  </button>

                  <button
                    onClick={() => handleOpenRegister(selectedEvent)}
                    disabled={selectedEvent.status === "Tutup"}
                    className="px-6 py-3 bg-[#0F1E3C] hover:bg-[#1a315e] text-white font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
                    id="trigger_registration_sheet_btn"
                  >
                    Daftar Sekarang
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: FORM REGISTRASI OVERLAY SCREEN */}
        {isRegistering && registerEvent && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 py-8 animate-fade-in" id="registration_form_modal">
            <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative block animate-scale-up">
              
              <button 
                onClick={() => setIsRegistering(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500 z-20 cursor-pointer transition"
                id="close_registration_overlay_btn"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="p-6 md:p-8 border-b border-stone-100">
                <span className="text-[9px] font-black uppercase text-[#F5A623] tracking-widest block mb-1">FORMULIR PENDAFTARAN RESMI</span>
                <h3 className="text-base font-black text-[#0F1E3C] leading-snug">Registrasi Peserta: {registerEvent.title}</h3>
                <p className="text-[11px] text-stone-500 mt-1">Gunakan Nomor Induk Mahasiswa (NIM) prodi terdaftar Anda untuk validasi presensi.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-5">
                
                {/* Input Fields block */}
                <div className="space-y-4">
                  
                  {/* Nama Lengkap */}
                  <div>
                    <label htmlFor="reg_field_name" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Nama Lengkap *</label>
                    <input
                      id="reg_field_name"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda sesuai KTM"
                      className={`w-full text-xs bg-stone-50 border rounded-xl px-4 py-3 outline-hidden focus:bg-white transition ${
                        formErrors.name ? "border-rose-500" : "border-stone-200 focus:border-[#0F1E3C]"
                      }`}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                    {formErrors.name && (
                      <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.name}</span>
                    )}
                  </div>

                  {/* NIM */}
                  <div>
                    <label htmlFor="reg_field_nim" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Nomor Induk Mahasiswa (NIM) *</label>
                    <input
                      id="reg_field_nim"
                      type="text"
                      placeholder="Contoh: 0110221xxx"
                      className={`w-full text-xs bg-stone-50 border rounded-xl px-4 py-3 outline-hidden focus:bg-white transition ${
                        formErrors.nim ? "border-rose-500" : "border-stone-200 focus:border-[#0F1E3C]"
                      }`}
                      value={formNim}
                      onChange={(e) => setFormNim(e.target.value)}
                    />
                    {formErrors.nim && (
                      <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.nim}</span>
                    )}
                  </div>

                  {/* Program Studi / Fakultas dropdown */}
                  <div>
                    <label htmlFor="reg_field_prodi" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Program Studi / Fakultas *</label>
                    <select
                      id="reg_field_prodi"
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-hidden focus:border-[#0F1E3C] focus:bg-white transition font-semibold"
                      value={formProdi}
                      onChange={(e) => setFormProdi(e.target.value)}
                    >
                      <option value="Teknik Informatika">Teknik Informatika (S1)</option>
                      <option value="Sistem Informasi">Sistem Informasi (S1)</option>
                      <option value="Desain Komunikasi Visual">Desain Komunikasi Visual (S1)</option>
                      <option value="Teknik Elektro">Teknik Elektro (S1)</option>
                      <option value="Akuntansi Syariah">Akuntansi Syariah (S1)</option>
                      <option value="Manajemen Bisnis">Manajemen Bisnis (S1)</option>
                    </select>
                  </div>

                  {/* Email Aktif */}
                  <div>
                    <label htmlFor="reg_field_email" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Email Aktif *</label>
                    <input
                      id="reg_field_email"
                      type="email"
                      placeholder="contoh@nurulfikri.ac.id"
                      className={`w-full text-xs bg-stone-50 border rounded-xl px-4 py-3 outline-hidden focus:bg-white transition ${
                        formErrors.email ? "border-rose-500" : "border-stone-200 focus:border-[#0F1E3C]"
                      }`}
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                    {formErrors.email && (
                      <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.email}</span>
                    )}
                  </div>

                  {/* No WhatsApp */}
                  <div>
                    <label htmlFor="reg_field_phone" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Nomor WhatsApp Aktif *</label>
                    <input
                      id="reg_field_phone"
                      type="text"
                      placeholder="08xxxxxxxx"
                      className={`w-full text-xs bg-stone-50 border rounded-xl px-4 py-3 outline-hidden focus:bg-white transition ${
                        formErrors.phone ? "border-rose-500" : "border-stone-200 focus:border-[#0F1E3C]"
                      }`}
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                    {formErrors.phone && (
                      <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.phone}</span>
                    )}
                  </div>

                  {/* Pertanyaan / Catatan Opsional */}
                  <div>
                    <label htmlFor="reg_field_notes" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Pertanyaan / Kebutuhan Khusus (Opsional)</label>
                    <textarea
                      id="reg_field_notes"
                      placeholder="Contoh: Kebutuhan konsumsi vegetarian, akses kursi roda, dsb..."
                      rows={2}
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 outline-hidden focus:border-[#0F1E3C] focus:bg-white transition"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>

                  {/* Checkbox agreement */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-stone-600">
                      <input
                        type="checkbox"
                        className="mt-0.5 rounded-sm border-stone-300 text-[#0F1E3C] focus:ring-[#0F1E3C]"
                        checked={formAgreed}
                        onChange={(e) => setFormAgreed(e.target.checked)}
                      />
                      <span>Saya menyetujui syarat &amp; ketentuan kepesertaan acara serta pendataan e-sertifikat Universitas Nurul Fikri.</span>
                    </label>
                    {formErrors.agreed && (
                      <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.agreed}</span>
                    )}
                  </div>

                </div>

                {/* CTA Action button block */}
                <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-5 py-3 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl cursor-pointer"
                    id="cancel_registration_submit_btn"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 text-xs font-black bg-[#0F1E3C] hover:bg-[#1a315e] text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed shadow-xs"
                    id="submit_registration_form_btn"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Kirim Registrasi
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* SECTION 6b: SUCCESS STATE TICKET POPUP */}
        {successTicket && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 px-4 py-8 animate-fade-in" id="registration_success_pop_lightbox">
            <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl text-center space-y-6 animate-scale-up">
              
              {/* Animated check circle logo */}
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#0F1E3C] uppercase">PENDAFTARAN BERHASIL!</h3>
                <p className="text-xs text-stone-500 font-medium">Tiket kehadiran digital Anda telah aktif dicetak ke sistem.</p>
              </div>

              {/* Glorious design ticket view */}
              <div className="border border-stone-200/90 bg-stone-50 rounded-2xl overflow-hidden shadow-xs relative">
                {/* Visual tickets side holes */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 bg-white border border-stone-200 rounded-full z-10" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 bg-white border border-stone-200 rounded-full z-10" />
                
                {/* Ticket Top */}
                <div className="p-4 bg-[#0F1E3C] text-white flex justify-between items-center text-left">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#F5A623] tracking-widest leading-none">EVENT HUB TICKET</h4>
                    <span className="text-xs font-black tracking-tight line-clamp-1 mt-1">{successTicket.eventName}</span>
                  </div>
                  <QrCode className="w-8 h-8 text-stone-300 shrink-0" />
                </div>

                {/* Ticket dotted divider line */}
                <div className="border-t border-dashed border-stone-250 mx-4 my-0.5" />

                {/* Ticket Details Panel */}
                <div className="p-5 text-left space-y-3 text-[11px] text-stone-600 font-medium">
                  <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-200/50">
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase tracking-wide">KODE INTEGRASI TIKET</span>
                      <span className="text-xs font-black text-[#0F1E3C] font-mono">{successTicket.ticketCode}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase tracking-wide">NAMA LENGKAP</span>
                      <span className="text-xs font-black text-stone-850 line-clamp-1">{successTicket.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 leading-snug">
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase">TANGGAL AGENDA</span>
                      <span>{formatDate(successTicket.date)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-stone-400 uppercase">LOKASI EVENT</span>
                      <span className="line-clamp-1">{successTicket.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Print / download actions block */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleDownloadTicket}
                  className="w-full py-3 bg-[#F5A623] hover:bg-[#e09418] border border-[#F5A623] text-[#0F1E3C] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                  id="down_ticket_file_btn"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  Unduh Tiket Fisik (.txt)
                </button>

                <button
                  onClick={() => setSuccessTicket(null)}
                  className="w-full py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-800 font-bold rounded-xl text-xs transition"
                  id="dismiss_ticket_lightbox_btn"
                >
                  Kembali ke Daftar Event
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Workspace>
  );
}
