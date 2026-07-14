"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { Calendar, MapPin, Users, HelpCircle } from "lucide-react";
import { formatDate } from "../../../../lib/utils";

export default function StaffEventsCalendar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [filterType, setFilterType] = useState<string>("Semua");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "staff") {
      router.push("/login");
      return;
    }

    const savedEvents = localStorage.getItem("eventhub_events");
    if (savedEvents) {
      try { setEvents(JSON.parse(savedEvents)); } catch (e) { setEvents(INITIAL_EVENTS); }
    } else {
      setEvents(INITIAL_EVENTS);
    }
  }, [user, loading, router]);

  const categories = ["Semua", "Seminar", "Workshop", "Lomba", "Olahraga", "Seni", "Sosial"];

  const filtered = filterType === "Semua" ? events : events.filter(e => e.category === filterType);

  if (loading || !user) return null;

  return (
    <Workspace id="staff_events_workspace">
      <div className="space-y-6" id="staff_events_viewport">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Arsip &amp; Dokumentasi Kalender Kampus</h2>
          <p className="text-xs text-stone-500 mt-1">Saring and awasi status pelaksanaan seminar, kompetisi tingkat prodi, dan turnamen olahraga tahunan.</p>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                filterType === cat
                  ? "bg-navy text-white font-black"
                  : "bg-white border border-stone-200 text-stone-605 hover:bg-stone-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((evt) => (
            <div key={evt.id} className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between" id={`staff_mgt_evt_card_${evt.id}`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase font-mono">
                  <span className="text-navy">{evt.category}</span>
                  <span className="text-stone-400">{evt.status}</span>
                </div>
                <h4 className="text-sm font-bold text-stone-850 leading-snug line-clamp-1">{evt.title}</h4>
                <p className="text-[10px] text-stone-400 mt-0.5">Penilai: {evt.coordinator} • PIC: {evt.organizer}</p>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{evt.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-105 flex items-center justify-between text-stone-505 font-semibold text-[11px] font-mono">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> <span className="line-clamp-1">{evt.location}</span></span>
                <span>{evt.pesertaCount} Mahasiswa</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Workspace>
  );
}
