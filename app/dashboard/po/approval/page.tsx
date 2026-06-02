"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { CheckSquare, ShieldX, PlayCircle, AlertCircle, Sparkles, CheckCircle } from "lucide-react";
import { formatDate } from "../../../../lib/utils";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function POApprovalGate() {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
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
  }, [user, router]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const pendingEvents = events.filter((e) => e.status === "Pending Approval");

  const handleApproveEvent = (eventId: string, title: string) => {
    const updated = events.map((e) => {
      if (e.id === eventId) {
        return { ...e, status: "Buka Pendaftaran" as const };
      }
      return e;
    });

    localStorage.setItem("eventhub_events", JSON.stringify(updated));
    setEvents(updated);

    // Push notification to Panitia and Mahasiswa
    const savedNotifs = localStorage.getItem("eventhub_notifications");
    let globalNotifs: any[] = [];
    if (savedNotifs) {
      try { globalNotifs = JSON.parse(savedNotifs); } catch (e) { }
    }
    const newNotif = {
      id: `notif-${Date.now()}`,
      category: "Publish",
      title: `Event Baru Disetujui: ${title}`,
      description: `Event '${title}' resmi disetujui oleh PO dan pendaftaran peserta telah dibuka!`,
      timestamp: new Date().toISOString(),
      isUnread: true,
      hasQuickAction: false,
      visibility: ["mahasiswa", "panitia", "staff"]
    };
    localStorage.setItem("eventhub_notifications", JSON.stringify([newNotif, ...globalNotifs]));

    addToast(`Sukses menyetujui event '${title}'! Pendaftaran peserta kini dibuka.`, "success");
  };

  const handleRejectEvent = (eventId: string, title: string) => {
    // Audit log / remove
    const updated = events.filter((e) => e.id !== eventId);
    localStorage.setItem("eventhub_events", JSON.stringify(updated));
    setEvents(updated);
    addToast(`Event '${title}' ditolak dan ditarik dari daftar pengajuan.`, "info");
  };

  return (
    <Workspace id="po_approval_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6" id="po_approval_viewport">
        {/* Title details */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Gerbang Persetujuan Event</h2>
          <p className="text-xs text-stone-500 mt-1">Review proposal, rujukan penanggungjawab, lokasi aula, dan setujui publikasi kalender acara.</p>
        </div>

        {/* Pending Stream */}
        {pendingEvents.length === 0 ? (
          <div className="py-16 text-center bg-white border border-stone-200 rounded-2xl shadow-xs">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-stone-700">Semua Proposal Bersih</h4>
            <p className="text-xs text-stone-400 mt-0.5">Tidak ada proposal baru yang menunggu persetujuan Anda saat ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingEvents.map((evt) => (
              <div key={evt.id} className="bg-white border border-stone-220/80 p-5 rounded-2xl shadow-xs space-y-4" id={`pending_row_${evt.id}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-100 pb-3 gap-3">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-sm">
                      {evt.category} • PROPOSAL BARU
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1.5 leading-snug">{evt.title}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5 font-medium">Diajukan oleh: <strong className="text-stone-600">{evt.coordinator}</strong></p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleRejectEvent(evt.id, evt.title)}
                      className="px-3.5 py-2 hover:bg-rose-50 text-rose-700 border border-rose-100/60 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApproveEvent(evt.id, evt.title)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      id={`approve_btn_${evt.id}`}
                    >
                      Tolak &amp; Approve
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-stone-500 leading-relaxed max-w-2xl font-medium">
                    {evt.description}
                  </p>

                  <div className="flex flex-wrap gap-4 pt-1.5 text-stone-500 font-semibold text-[11px] font-mono">
                    <span>Tanggal: {formatDate(evt.date)}</span>
                    <span>•</span>
                    <span>Sektor: {evt.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Workspace>
  );
}
