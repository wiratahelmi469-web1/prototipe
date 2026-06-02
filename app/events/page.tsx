"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Workspace from "../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../lib/mockData";
import { Calendar, MapPin, Users, Flame, Sparkles, Filter, Plus, Search, HelpCircle, CheckCircle } from "lucide-react";
import { formatDate } from "../../lib/utils";
import Toast, { ToastContainer } from "../../components/Toast";

export default function PublicEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Initialize/sync events state from local storage so edits transfer immediately
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

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filter logic
  const filteredEvents = events.filter((evt) => {
    const matchesCategory = categoryFilter === "Semua" || evt.category === categoryFilter;
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRegisterToEvent = (eventId: string, eventTitle: string) => {
    if (!user || !user.isLoggedIn) {
      addToast("Silakan sign-in terlebih dahulu sebagai Mahasiswa untuk mendaftar event.", "info");
      return;
    }

    if (user.role !== "mahasiswa") {
      addToast("Hanya mahasiswa terdaftar yang dapat mendaftar masuk sebagai peserta.", "error");
      return;
    }

    // Capture registration in local storage
    const registeredKey = `registered_${user.email}_events`;
    const savedRegs = localStorage.getItem(registeredKey);
    let myRegsList: string[] = [];
    if (savedRegs) {
      try { myRegsList = JSON.parse(savedRegs); } catch (e) { myRegsList = []; }
    }

    if (myRegsList.includes(eventId)) {
      addToast("Anda sudah terdaftar untuk kegiatan ini! Cek 'Riwayat' untuk tiket QR Anda.", "info");
      return;
    }

    // Save registration
    const updatedRegs = [...myRegsList, eventId];
    localStorage.setItem(registeredKey, JSON.stringify(updatedRegs));

    // Increment peserta count
    const updatedEvents = events.map((evt) => {
      if (evt.id === eventId) {
        const newCount = evt.pesertaCount + 1;
        return {
          ...evt,
          pesertaCount: newCount,
          status: newCount >= 150 ? "Hampir Penuh" as const : evt.status
        };
      }
      return evt;
    });

    localStorage.setItem("eventhub_events", JSON.stringify(updatedEvents));
    setEvents(updatedEvents);

    addToast(`Sukses mendaftar! Tiket QR Anda untuk '${eventTitle}' telah dicetak.`, "success");
  };

  const categories = ["Semua", "Seminar", "Workshop", "Lomba", "Olahraga", "Seni", "Sosial"];

  return (
    <Workspace id="public_events_workspace">
      {/* Dynamic Toasts Banners */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Hero Welcome Unit */}
      <div className="bg-indigo-900 border border-indigo-850 text-white rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden" id="public_events_hero">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 -z-5 animate-pulse" />
        
        <div className="max-w-2xl z-10 relative">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-indigo-800 text-indigo-200 px-3 py-1 rounded-full border border-indigo-700/60 mb-4 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-indigo-200" />
            Kalender Event Terpusat
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Temukan Edukasi &amp; Kreasi Seru di Kampus!
          </h2>
          <p className="text-xs md:text-sm text-indigo-200/90 leading-relaxed mt-2 max-w-lg">
            Pantau seminar teknologi, workshop UI/UX design, perlombaan olahraga rujukan, konser musik penutup, and kumpulkan sertifikat kehadiran digital ber-barcode Anda secara instant.
          </p>
        </div>
      </div>

      {/* Filter and Search Action Unit */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white border border-stone-200 p-4.5 rounded-2xl mb-6 shadow-xs" id="filter_search_actions">
        {/* Category tags */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
          <span className="p-1 rounded-lg text-stone-400">
            <Filter className="w-4 h-4" />
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-stone-50 border border-stone-250/60 text-stone-600 hover:bg-stone-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live query search box */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Cari event, aula, humas..."
            className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 outline-hidden focus:border-indigo-500/80 focus:bg-white transition-all font-semibold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
        </div>
      </div>

      {/* Events Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="events_cards_grid">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border border-stone-150 rounded-2xl shadow-xs">
            <HelpCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-700">Tidak ada event yang ditemukan</h4>
            <p className="text-xs text-stone-500 mt-0.5">Coba ganti filter kategori atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const hasJoinedFlag = user?.isLoggedIn && 
              (() => {
                const regs = localStorage.getItem(`registered_${user.email}_events`);
                if (regs) {
                  try { return (JSON.parse(regs) as string[]).includes(evt.id); } catch(e) { return false; }
                }
                return false;
              })();

            return (
              <div
                key={evt.id}
                className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                id={`event_card_${evt.id}`}
              >
                {/* Header Meta */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                        {evt.category}
                      </span>
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        evt.status === "Buka Pendaftaran" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        evt.status === "Hampir Penuh" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        evt.status === "Pending Approval" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                        "bg-stone-50 text-stone-500"
                      }`}>
                        {evt.status}
                      </span>
                    </div>

                    <Link href={`/events/${evt.id}`}>
                      <h4 className="text-sm font-extrabold text-stone-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2">
                        {evt.title}
                      </h4>
                    </Link>
                    <p className="text-[10px] text-stone-400 font-medium mt-1">oleh {evt.organizer}</p>

                    <p className="text-xs text-stone-500 line-clamp-3 mt-3.5 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  {/* Core detail specs */}
                  <div className="space-y-1.5 mt-5 pt-4.5 border-t border-stone-100 text-stone-600 font-medium">
                    <div className="flex items-center gap-2 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{formatDate(evt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="line-clamp-1">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{evt.pesertaCount} Peserta Terdaftar</span>
                    </div>
                  </div>
                </div>

                {/* Card Button footer actions */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                  <Link
                    href={`/events/${evt.id}`}
                    className="flex-1 py-2 text-center text-xs font-bold text-stone-800 hover:text-indigo-600 bg-white border border-stone-250/70 hover:border-indigo-300 rounded-xl transition-all"
                  >
                    Detail Deskripsi
                  </Link>

                  {evt.status === "Pending Approval" ? (
                    <button
                      disabled
                      className="py-2 px-3 text-xs bg-stone-200 text-stone-400 font-bold rounded-xl cursor-not-allowed"
                    >
                      Menunggu Approval PO
                    </button>
                  ) : hasJoinedFlag ? (
                    <button
                      disabled
                      className="py-2 px-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      Terdaftar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegisterToEvent(evt.id, evt.title)}
                      className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                      id={`register_btn_card_${evt.id}`}
                    >
                      Daftar Event
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Workspace>
  );
}
