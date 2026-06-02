"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { Eye, Calendar, MapPin, Users, Settings } from "lucide-react";
import { formatDate } from "../../../../lib/utils";

export default function POSupervisedEvents() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "po") {
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

  if (loading || !user) return null;

  return (
    <Workspace id="po_supervised_events_workspace">
      <div className="max-w-4xl mx-auto space-y-6" id="po_events_viewport">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Audit &amp; Pengawasan Event</h2>
          <p className="text-xs text-stone-500 mt-1">Gunakan panel ini untuk mengamati persentase progres kepanitiaan and kelengkapan logistik.</p>
        </div>

        {/* Supervised List */}
        <div className="space-y-4">
          {events.map((evt) => (
            <div key={evt.id} className="bg-white border border-stone-200 p-5 rounded-2xl shadow-xs space-y-4" id={`super_evt_${evt.id}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-100 pb-3 gap-3">
                <div>
                  <span className="text-[9px] font-extrabold uppercase bg-stone-50 text-stone-500 border border-stone-200 px-2.5 py-0.5 rounded-sm">
                    {evt.category} • {evt.status}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 mt-1.5 leading-snug">{evt.title}</h4>
                  <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Panitia Utama: <strong className="text-stone-600">{evt.coordinator}</strong></p>
                </div>

                <span className="text-xs font-bold text-stone-500 font-mono">
                  {evt.pesertaCount} Peserta Terdaftar
                </span>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-stone-500">Kelengkapan Logistik Divisi</span>
                  <span className="text-indigo-600 font-bold">{evt.progress}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 p-[1px]">
                  <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${evt.progress}%` }} />
                </div>
              </div>

              {/* Meta information */}
              <div className="flex flex-wrap gap-4 pt-1 text-stone-500 font-semibold text-[11px] font-mono">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(evt.date)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evt.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Workspace>
  );
}
