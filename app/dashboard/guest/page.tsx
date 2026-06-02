"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Workspace from "../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../lib/mockData";
import { Calendar, MapPin, Users, LogIn, Sparkles, HelpCircle } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export default function GuestDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const savedEvents = localStorage.getItem("eventhub_events");
    if (savedEvents) {
      try { setEvents(JSON.parse(savedEvents)); } catch(e) { setEvents(INITIAL_EVENTS); }
    } else {
      setEvents(INITIAL_EVENTS);
    }
  }, []);

  return (
    <Workspace id="guest_dashboard">
      <div className="max-w-4xl mx-auto space-y-8" id="guest_layout_viewport">
        {/* Welcome Unit */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Mode Eksplorasi Tamu
            </span>
            <h2 className="text-xl font-bold tracking-tight text-stone-900">
              Selamat Datang di EventHub Kampus!
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed max-w-md">
              Anda mengakses portal sebagai Tamu. Anda dapat melihat kalender event aktif Universitas Nurul Fikri, namun untuk mendaftar dan mengklaim sertifikat, harap sign-in sejenak.
            </p>
          </div>
          <Link
            href="/login"
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs shrink-0 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            id="guest_login_link"
          >
            <LogIn className="w-4 h-4" />
            Sign In / Register
          </Link>
        </div>

        {/* Catalog Section */}
        <div>
          <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-4 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" />
            DAFTAR EVENT AKTIF (PUBLIC VIEW)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => (
              <div key={evt.id} className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between" id={`guest_evt_card_${evt.id}`}>
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[9px] font-extrabold uppercase bg-stone-50 text-stone-500 border border-stone-200 px-2 py-0.5 rounded">
                      {evt.category}
                    </span>
                    <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-indigo-600">{evt.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 leading-snug line-clamp-2">{evt.title}</h4>
                  <p className="text-[10px] text-stone-400 mt-0.5 mb-3">oleh {evt.organizer}</p>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{evt.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-stone-500 font-semibold text-[11px]">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-stone-400" /> {evt.location}</span>
                  <Link href={`/events/${evt.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold transition-colors">
                    Selengkapnya &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Workspace>
  );
}
