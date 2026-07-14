"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Workspace from "../../../components/Workspace";
import { INITIAL_EVENTS, INITIAL_RUNDOWN, EventItem, RundownItem } from "../../../lib/mockData";
import { Calendar, MapPin, Users, Flame, ArrowLeft, Clock, Shield, User, CornerDownRight, CheckCircle, Ticket } from "lucide-react";
import { formatDate } from "../../../lib/utils";
import Toast, { ToastContainer } from "../../../components/Toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const { user } = useAuth();
  const router = useRouter();

  const [evt, setEvt] = useState<EventItem | null>(null);
  const [rundowns, setRundowns] = useState<RundownItem[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    // Sync / Load events
    const savedEvents = localStorage.getItem("eventhub_events");
    let currentEvents: EventItem[] = [];
    if (savedEvents) {
      try { currentEvents = JSON.parse(savedEvents); } catch (e) { currentEvents = INITIAL_EVENTS; }
    } else {
      currentEvents = INITIAL_EVENTS;
    }

    const found = currentEvents.find((e) => e.id === eventId);
    if (found) {
      setEvt(found);
    }

    // Sync / Load rundowns
    const savedRundowns = localStorage.getItem("eventhub_rundowns");
    let currentRundowns: RundownItem[] = [];
    if (savedRundowns) {
      try { currentRundowns = JSON.parse(savedRundowns); } catch (e) { currentRundowns = INITIAL_RUNDOWN; }
    } else {
      currentRundowns = INITIAL_RUNDOWN;
    }
    setRundowns(currentRundowns.filter((r) => r.eventId === eventId));
  }, [eventId]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRegister = () => {
    if (!user || !user.isLoggedIn) {
      addToast("Silakan sign-in terlebih dahulu sebagai Mahasiswa untuk mendaftar event.", "info");
      return;
    }

    if (user.role !== "mahasiswa") {
      addToast("Hanya mahasiswa terdaftar yang dapat mendaftar masuk sebagai peserta.", "error");
      return;
    }

    if (!evt) return;

    const registeredKey = `registered_${user.email}_events`;
    const savedRegs = localStorage.getItem(registeredKey);
    let myRegsList: string[] = [];
    if (savedRegs) {
      try { myRegsList = JSON.parse(savedRegs); } catch (e) { myRegsList = []; }
    }

    if (myRegsList.includes(evt.id)) {
      addToast("Anda sudah terdaftar! Cek tiket QR di halaman riwayat.", "info");
      return;
    }

    // Save registration
    const updatedRegs = [...myRegsList, evt.id];
    localStorage.setItem(registeredKey, JSON.stringify(updatedRegs));

    // Update global event list
    const savedEvents = localStorage.getItem("eventhub_events");
    if (savedEvents) {
      try {
        const list: EventItem[] = JSON.parse(savedEvents);
        const updatedList = list.map((item) => {
          if (item.id === evt.id) {
            const count = item.pesertaCount + 1;
            return {
              ...item,
              pesertaCount: count,
              status: count >= 150 ? "Hampir Penuh" as const : item.status
            };
          }
          return item;
        });
        localStorage.setItem("eventhub_events", JSON.stringify(updatedList));
        const matched = updatedList.find((e) => e.id === evt.id);
        if (matched) setEvt(matched);
      } catch (e) { }
    }

    addToast("Pendaftaran Berhasil! Anda telah terdaftar di event ini.", "success");
  };

  if (!evt) {
    return (
      <Workspace id="not_found_detail_workspace">
        <div className="py-20 text-center bg-white border border-stone-150 rounded-2xl max-w-md mx-auto">
          <HelpCircleIcon />
          <h4 className="text-sm font-bold text-stone-700 mt-2">Data Event tidak ditemukan</h4>
          <Link href="/events" className="mt-4 inline-flex text-xs font-bold text-navy hover:underline">
            Kembali ke Kalender Event
          </Link>
        </div>
      </Workspace>
    );
  }

  // Check if participant registered
  const isJoined = !!(user?.isLoggedIn && (() => {
    if (typeof window === "undefined") return false;
    const regs = localStorage.getItem(`registered_${user.email}_events`);
    if (regs) {
      try { return (JSON.parse(regs) as string[]).includes(evt.id); } catch(e) { return false; }
    }
    return false;
  })());

  // Check if we need to map the display status for Mahasiswa
  const getMappedStatusForMahasiswa = (status: string, hasJoined: boolean, currentPeserta: number) => {
    if (hasJoined) {
      return "Terdaftar";
    }
    const lowerStatus = status.toLowerCase();
    
    // Internal/Approval Workflow statuses leak prevention
    const internalList = [
      "pending approval", "pending_approval", "submitted", "under review", "under_review", 
      "revision requested", "revision_requested", "draft", "rejected", "tutup", "selesai"
    ];
    
    if (internalList.includes(lowerStatus)) {
      if (lowerStatus === "rejected") {
        return "Event Dibatalkan";
      }
      return "Pendaftaran Ditutup";
    }

    if (currentPeserta >= 150) {
      return "Kuota Penuh";
    }

    return status; // "Buka Pendaftaran" / "Hampir Penuh"
  };

  return (
    <Workspace id={`event_detail_workspace_${evt.id}`}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Back breadcrumb navigation */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-navy transition-colors font-semibold mb-6"
        id="detail_back_to_events"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Daftar Event
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Description Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 md:p-8 shadow-xs">
            {/* Meta Tags */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-navy-tint text-navy border border-navy-light/10 rounded-md">
                {evt.category}
              </span>
              {(() => {
                const displayStatus = getMappedStatusForMahasiswa(evt.status, isJoined, evt.pesertaCount);
                let badgeStyle = "bg-stone-50 border border-stone-200 text-stone-500";
                
                if (displayStatus === "Terdaftar" || displayStatus === "Buka Pendaftaran") {
                  badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                } else if (displayStatus === "Hampir Penuh" || displayStatus === "Sudah Terdaftar") {
                  badgeStyle = "bg-amber-50 text-amber-700 border border-amber-100";
                } else if (displayStatus === "Kuota Penuh" || displayStatus === "Event Dibatalkan") {
                  badgeStyle = "bg-rose-50 text-rose-700 border border-rose-100";
                } else if (displayStatus === "Pendaftaran Ditutup") {
                  badgeStyle = "bg-stone-100 text-stone-500 border border-stone-200";
                }
                
                return (
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
                    {displayStatus}
                  </span>
                );
              })()}
            </div>

            {/* Title Header */}
            <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight leading-snug">
              {evt.title}
            </h1>
            <p className="text-xs text-stone-400 font-medium mt-1">Diselenggarakan oleh: <strong className="text-stone-600">{evt.organizer}</strong></p>

            {/* Description Text */}
            <div className="mt-6 pt-6 border-t border-stone-100">
              <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-2.5">DESKRIPSI KEGIATAN</h3>
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                {evt.description}
              </p>
            </div>
          </div>

          {/* Rundown Schedule Card */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-navy" />
              RUNDOWN &amp; ACARA INTENS KAMPUS
            </h3>

            {rundowns.length === 0 ? (
              <p className="text-xs text-stone-400 italic">Rundown detail sedang difinalisasi oleh Panitia Humas.</p>
            ) : (
              <div className="relative border-l border-navy-light/10 ml-2.5 pl-5.5 space-y-5">
                {rundowns.map((item) => (
                  <div key={item.id} className="relative" id={`rundown_item_${item.id}`}>
                    {/* Ring timeline point */}
                    <span className={`absolute -left-[28.5px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${
                      item.isLive ? "bg-navy animate-ping" : "bg-stone-200"
                    }`} />
                    <span className={`absolute -left-[28.5px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white ${
                      item.isLive ? "bg-navy" : "bg-stone-200"
                    }`} />

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy font-mono">
                      <span>{item.timeStart} - {item.timeEnd} WIB</span>
                      {item.isLive && (
                        <span className="bg-rose-100 text-rose-800 text-[8px] tracking-wide font-extrabold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 animate-pulse uppercase">
                          <Flame className="w-2.5 h-2.5 fill-rose-800" />
                          Live Now
                        </span>
                      )}
                      {item.isCompleted && (
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] tracking-wide px-1.5 py-0.5 rounded-sm uppercase">
                          Selesai
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-stone-800 mt-0.5">{item.title}</h5>
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-1 font-mono">
                      <span>PIC: {item.pic}</span>
                      <span>•</span>
                      <span>Sektor: {item.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Utilities sidebar */}
        <div className="space-y-6">
          {/* Quick Registry Action Stub */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-4">KLIK TIKET SEKARANG</h3>
            
            <div className="space-y-3 mb-5">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">MEMBER KAMPUS</span>
                <p className="text-xs font-semibold text-stone-700">{user?.name || "Tamu Kunjungan (Guest)"}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">AULA UTAMA</span>
                <p className="text-xs font-semibold text-stone-700">{evt.location}</p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">DOKUMEN KELUARAN</span>
                <p className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                  E-Sertifikat Ber-Barcode
                </p>
              </div>
            </div>

            {isJoined ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl text-center text-xs font-bold animate-fade-in">
                  Pendaftaran Berhasil! Anda telah terdaftar di event ini.
                </div>
                <Link
                  href="/dashboard/mahasiswa/riwayat"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 text-center text-xs font-extrabold bg-navy hover:bg-navy-mid text-white rounded-xl shadow-xs transition-colors"
                  id="claimed_badge_ticket_ref"
                >
                  <Ticket className="w-4 h-4" />
                  Keluarkan Tiket QR Anda
                </Link>
              </div>
            ) : (() => {
              const lowerStatus = evt.status.toLowerCase();
              const isInternal = [
                "pending approval", "pending_approval", "submitted", "under review", "under_review", 
                "revision requested", "revision_requested", "draft", "tutup", "selesai"
              ].includes(lowerStatus);
              const isFull = evt.pesertaCount >= 150;
              
              if (lowerStatus === "rejected") {
                return (
                  <button
                    disabled
                    className="w-full py-3 text-center text-xs font-bold bg-red-50 text-red-500 border border-red-100 rounded-xl cursor-not-allowed"
                  >
                    Event Dibatalkan
                  </button>
                );
              }
              
              if (isInternal) {
                return (
                  <button
                    disabled
                    className="w-full py-3 text-center text-xs font-bold bg-stone-100 text-stone-400 border border-stone-200 rounded-xl cursor-not-allowed"
                  >
                    Pendaftaran Ditutup
                  </button>
                );
              }
              
              if (isFull) {
                return (
                  <button
                    disabled
                    className="w-full py-3 text-center text-xs font-bold bg-rose-50 text-rose-500 border border-rose-100 rounded-xl cursor-not-allowed"
                  >
                    Kuota Penuh
                  </button>
                );
              }
              
              return (
                <button
                  onClick={handleRegister}
                  className="w-full py-3.5 text-center text-xs font-extrabold bg-navy hover:bg-navy-mid text-white rounded-xl shadow-md transition-all cursor-pointer"
                  id={`register_event_button_details_${evt.id}`}
                >
                  Registrasi Peserta
                </button>
              );
            })()}
          </div>

          {/* Coordinator Profile card */}
          <div className="bg-stone-100/50 border border-stone-200 rounded-2xl p-5">
            <h4 className="text-[10px] font-black uppercase text-stone-450 tracking-wider mb-2.5">PENGHUBUNG PANITIA</h4>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-navy-tint text-navy flex items-center justify-center font-black text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">{evt.coordinator}</p>
                <p className="text-[9px] text-stone-400 font-mono">Division Coordinator • HMIF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}

function HelpCircleIcon() {
  return (
    <svg className="w-10 h-10 text-stone-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
