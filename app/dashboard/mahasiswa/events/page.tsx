"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { Calendar, MapPin, Users, HelpCircle, CheckCircle, Trash2, SlidersHorizontal } from "lucide-react";
import { formatDate } from "../../../../lib/utils";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function MahasiswaEventsManager() {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (!user || user.role !== "mahasiswa") {
      router.push("/login");
      return;
    }

    // Sync / Load registered lists
    const registeredKey = `registered_${user.email}_events`;
    const savedRegs = localStorage.getItem(registeredKey);
    let myRegsList: string[] = [];
    if (savedRegs) {
      try { myRegsList = JSON.parse(savedRegs); } catch (e) { myRegsList = []; }
    }
    setRegisteredIds(myRegsList);

    // Sync / Load events catalog
    const savedEvents = localStorage.getItem("eventhub_events");
    let currentEvents: EventItem[] = [];
    if (savedEvents) {
      try { currentEvents = JSON.parse(savedEvents); } catch (e) { currentEvents = INITIAL_EVENTS; }
    } else {
      currentEvents = INITIAL_EVENTS;
    }
    setEvents(currentEvents);
  }, [user, router]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRegister = (eventId: string, title: string) => {
    if (registeredIds.includes(eventId)) return;

    const registeredKey = `registered_${user?.email}_events`;
    const updated = [...registeredIds, eventId];
    localStorage.setItem(registeredKey, JSON.stringify(updated));
    setRegisteredIds(updated);

    // Increase total peserta
    const updatedEvents = events.map((item) => {
      if (item.id === eventId) {
        const counts = item.pesertaCount + 1;
        return {
          ...item,
          pesertaCount: counts,
          status: counts >= 150 ? "Hampir Penuh" as const : item.status
        };
      }
      return item;
    });

    localStorage.setItem("eventhub_events", JSON.stringify(updatedEvents));
    setEvents(updatedEvents);

    addToast(`Sukses bergabung di '${title}'! Tiket QR Anda dicetak.`, "success");
  };

  const handleLeaveEvent = (eventId: string, title: string) => {
    const registeredKey = `registered_${user?.email}_events`;
    const updated = registeredIds.filter((id) => id !== eventId);
    localStorage.setItem(registeredKey, JSON.stringify(updated));
    setRegisteredIds(updated);

    // Decrease participants count list
    const updatedEvents = events.map((item) => {
      if (item.id === eventId) {
        const counts = Math.max(0, item.pesertaCount - 1);
        return {
          ...item,
          pesertaCount: counts,
          status: "Buka Pendaftaran" as const
        };
      }
      return item;
    });

    localStorage.setItem("eventhub_events", JSON.stringify(updatedEvents));
    setEvents(updatedEvents);

    addToast(`Berhasil membatalkan pendaftaran pada '${title}'.`, "info");
  };

  return (
    <Workspace id="student_my_events">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="space-y-6" id="mhs_events_viewport">
        {/* Title details */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Portal Keanggotaan Event</h2>
          <p className="text-xs text-stone-500 mt-1">Sederhanakan pendaftaran atau batalkan rujukan kehadiran Anda dalam satu klik.</p>
        </div>

        {/* List layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => {
            const hasJoined = registeredIds.includes(evt.id);

            return (
              <div key={evt.id} className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between" id={`sub_mhs_evt_card_${evt.id}`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-extrabold font-mono text-indigo-700 uppercase tracking-wider">
                    <span>{evt.category}</span>
                    <span className={`px-2 py-0.5 rounded-sm ${
                      hasJoined ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"
                    }`}>
                      {hasJoined ? "Telah Berpartisipasi" : "Belum Terdaftar"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug">{evt.title}</h4>
                  <p className="text-[10px] text-stone-400 mt-0.5">oleh {evt.organizer}</p>

                  <div className="space-y-1.5 pt-3 text-stone-500 font-semibold text-[11px]">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> <span>{formatDate(evt.date)}</span></div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> <span className="line-clamp-1">{evt.location}</span></div>
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> <span>{evt.pesertaCount} Peserta</span></div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2">
                  {evt.status === "Pending Approval" ? (
                    <button disabled className="w-full py-2 bg-stone-200 text-stone-400 text-xs font-bold rounded-xl cursor-not-allowed">
                      Pending Approvals
                    </button>
                  ) : hasJoined ? (
                    <button
                      onClick={() => handleLeaveEvent(evt.id, evt.title)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      id={`opt_out_btn_${evt.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      Batalkan Kehadiran
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(evt.id, evt.title)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      id={`opt_in_btn_${evt.id}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      Gabung Sekarang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Workspace>
  );
}
