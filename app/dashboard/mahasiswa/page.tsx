"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Workspace from "../../../components/Workspace";
import { INITIAL_EVENTS, INITIAL_NOTIFICATIONS, EventItem, NotificationItem } from "../../../lib/mockData";
import { BookOpen, Calendar, Award, Sparkles, MessageSquare, Send, CheckCircle, Ticket, Compass, ArrowRight } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export default function MahasiswaOverviewDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [joinedEvents, setJoinedEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Gemini AI variables
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("Halo! Saya Gemini Assistant. Ada yang perlu dibantu mengenai jadwal, pendaftaran, atau sertifikat EventHub hari ini?");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "mahasiswa") {
      router.push("/login");
      return;
    }

    // Load registered events for user
    const registeredKey = `registered_${user.email}_events`;
    const savedRegs = localStorage.getItem(registeredKey);
    let myRegsList: string[] = [];
    if (savedRegs) {
      try { myRegsList = JSON.parse(savedRegs); } catch (e) { myRegsList = []; }
    }

    // Fetch and sync global events list
    const savedEvents = localStorage.getItem("eventhub_events");
    let globalEvents: EventItem[] = [];
    if (savedEvents) {
      try { globalEvents = JSON.parse(savedEvents); } catch (e) { globalEvents = INITIAL_EVENTS; }
    } else {
      globalEvents = INITIAL_EVENTS;
    }

    setJoinedEvents(globalEvents.filter((item) => myRegsList.includes(item.id)));

    // Sync notification list
    const savedNotifs = localStorage.getItem("eventhub_notifications");
    let globalNotifs: NotificationItem[] = [];
    if (savedNotifs) {
      try { globalNotifs = JSON.parse(savedNotifs); } catch (e) { globalNotifs = INITIAL_NOTIFICATIONS; }
    } else {
      globalNotifs = INITIAL_NOTIFICATIONS;
    }
    setNotifications(globalNotifs.filter(n => n.visibility.includes("mahasiswa")));

  }, [user, loading, router]);

  const askGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiResponse("Berpikir sejenak...");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: {
            userName: user?.name,
            userRole: user?.role,
            joinedEventsCount: joinedEvents.length,
            eventsList: joinedEvents.map(e => e.title)
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.text);
      } else {
        setAiResponse("Koneksi sibuk. Silakan coba diskusikan kembali.");
      }
    } catch (err) {
      setAiResponse("Koneksi sibuk. Silakan coba diskusikan kembali.");
    } finally {
      setAiPrompt("");
      setAiLoading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <Workspace id="mahasiswa_dashboard_viewport">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Student Unit */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs relative overflow-hidden" id="student_welcome_panel">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-lg uppercase shadow-inner">
                {user.name[0]}
              </div>
              <div>
                <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest font-mono">DASHBOARD MAHASISWA</p>
                <h2 className="text-base font-black text-stone-900 mt-0.5">Hai, {user.name}!</h2>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">Pendaftaran Anda aktif. Pastikan tiket QR Anda siap scan saat menghadiri auditorium.</p>
              </div>
            </div>

            {/* Micro Statistics Row */}
            <div className="grid grid-cols-3 gap-4 border-t border-stone-105 mt-6 pt-5">
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Event Diikuti</span>
                <span className="text-xl font-black text-indigo-700 font-mono block mt-1">{joinedEvents.length}</span>
              </div>
              <div className="text-center md:text-left border-l border-r border-stone-105 px-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Sertifikat Siap</span>
                <span className="text-xl font-black text-emerald-600 font-mono block mt-1">2</span>
              </div>
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Kehadiran Scan</span>
                <span className="text-xl font-black text-amber-600 font-mono block mt-1">1</span>
              </div>
            </div>
          </div>

          {/* Joined Event List Mini Table */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase text-stone-450 tracking-wider">EVENT SAYA DIKUTI</h3>
              <Link href="/dashboard/mahasiswa/riwayat" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all">
                Ambil Tiket QR <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {joinedEvents.length === 0 ? (
              <div className="py-8 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                <Compass className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs">Kamu belum bergabung dalam event apapun.</p>
                <Link href="/events" className="mt-3 inline-flex px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-xs">
                  Eksplorasi Event Publik
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {joinedEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 border border-stone-150/80 hover:border-stone-250 rounded-xl flex items-center justify-between gap-4 transition-all" id={`my_event_${evt.id}`}>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">{evt.category}</span>
                      <h4 className="text-xs font-bold text-stone-850 leading-snug line-clamp-1">{evt.title}</h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">{formatDate(evt.date)} • {evt.location}</p>
                    </div>

                    <Link
                      href={`/events/${evt.id}`}
                      className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-[10px] font-bold tracking-wide shrink-0 transition-colors"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Space with Gemini AI Module */}
        <div className="space-y-6">
          {/* Gemini AI advisory chatbot */}
          <div className="bg-indigo-950 text-white border border-indigo-900 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[340px]" id="gemini_advisor_panel">
            <div>
              <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-widest font-black text-indigo-300 bg-indigo-900/60 px-2.5 py-0.5 rounded-sm border border-indigo-700/50 mb-3.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                Asisten AI Gemini
              </span>
              <h4 className="text-xs font-black tracking-tight uppercase text-stone-100">
                Konsultasi Agenda &amp; Karir
              </h4>
              <p className="text-[11px] text-indigo-200/90 leading-relaxed mt-1">
                Tanyakan kelayakan event akademik, review CV, atau minta peta strategi belajar berdasarkan minat organisasi Anda.
              </p>

              {/* Bot Response Bubble */}
              <div className="bg-indigo-900/80 border border-indigo-800/40 p-3 rounded-xl text-[11px] mt-4 leading-relaxed font-semibold italic text-indigo-100 max-h-[140px] overflow-y-auto custom-scrollbar">
                {aiResponse}
              </div>
            </div>

            {/* Chat Prompt form */}
            <form onSubmit={askGemini} className="relative mt-4">
              <input
                type="text"
                required
                disabled={aiLoading}
                placeholder="Diskusikan modul webinar Gemini..."
                className="w-full text-xs bg-indigo-900/40 border border-indigo-800 rounded-xl py-2.5 pl-4 pr-11 outline-hidden focus:border-indigo-500 font-semibold text-white placeholder-indigo-300/60"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="absolute right-1 top-1 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Local Notifications list */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider mb-3">PEMBERITAHUAN MAHASISWA</h3>
            <div className="divide-y divide-stone-50 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {notifications.map((notif) => (
                <div key={notif.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="font-extrabold text-indigo-700 uppercase tracking-widest">{notif.category}</span>
                    <span className="text-stone-400">{formatDate(notif.timestamp)}</span>
                  </div>
                  <h5 className="text-xs font-bold text-stone-850 leading-snug">{notif.title}</h5>
                  <p className="text-[10px] text-stone-500 leading-relaxed line-clamp-2">{notif.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
