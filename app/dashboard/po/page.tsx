"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Workspace from "../../../components/Workspace";
import { INITIAL_EVENTS, INITIAL_NOTIFICATIONS, EventItem, NotificationItem } from "../../../lib/mockData";
import { ShieldCheck, BarChart3, Users, Award, CalendarDays, FileCheck, ArrowRight, Hourglass } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export default function PODashboardHome() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "po") {
      router.push("/login");
      return;
    }

    // Load events
    const savedEvents = localStorage.getItem("eventhub_events");
    let currentEvents: EventItem[] = [];
    if (savedEvents) {
      try { currentEvents = JSON.parse(savedEvents); } catch (e) { currentEvents = INITIAL_EVENTS; }
    } else {
      currentEvents = INITIAL_EVENTS;
    }
    setEvents(currentEvents);

    // Sync notification feed
    const savedNotifs = localStorage.getItem("eventhub_notifications");
    let globalNotifs: NotificationItem[] = [];
    if (savedNotifs) {
      try { globalNotifs = JSON.parse(savedNotifs); } catch (e) { globalNotifs = INITIAL_NOTIFICATIONS; }
    } else {
      globalNotifs = INITIAL_NOTIFICATIONS;
    }
    setNotifications(globalNotifs.filter(n => n.visibility.includes("po")));
  }, [user, loading, router]);

  if (loading || !user) return null;

  // Key metrics
  const pendingEventsLen = events.filter((e) => e.status === "Pending Approval").length;
  const activeEventsLen = events.filter((e) => e.status !== "Pending Approval" && e.status !== "Selesai").length;

  return (
    <Workspace id="po_dashboard_main_viewport">
      <div className="space-y-6" id="po_home_substructure">
        {/* PO Header Board */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center gap-4.5 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center font-extrabold text-base uppercase">
              {user.name[0]}
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest font-mono">DASHBOARD PROJECT OFFICER (PO)</p>
              <h2 className="text-base font-black text-stone-900 mt-0.5">Maju Bersama, {user.name}!</h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Awasi kualitas agenda, verifikasi anggaran, dan pastikan penyaluran e-sertifikat berjalan lancar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/po/approval"
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              Kelola Approval ({pendingEventsLen})
            </Link>
          </div>
        </div>

        {/* PO Stats Counter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="po_sc_indicators">
          <div className="bg-white border border-stone-205 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Menunggu Approval</span>
              <span className="text-xl font-black text-indigo-705 font-mono block">{pendingEventsLen} Event</span>
            </div>
            <Hourglass className="w-6 h-6 text-stone-400 shrink-0" />
          </div>

          <div className="bg-white border border-stone-205 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Event Berjalan</span>
              <span className="text-xl font-black text-emerald-600 font-mono block">{activeEventsLen} Kegiatan</span>
            </div>
            <CalendarDays className="w-6 h-6 text-stone-400 shrink-0" />
          </div>

          <div className="bg-white border border-stone-205 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Total Organisasi</span>
              <span className="text-xl font-black text-amber-600 font-mono block">4 Divisi</span>
            </div>
            <Users className="w-6 h-6 text-stone-400 shrink-0" />
          </div>

          <div className="bg-white border border-stone-205 p-4.5 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider block">Validasi Sertifikat</span>
              <span className="text-xl font-black text-stone-800 font-mono block">89%</span>
            </div>
            <Award className="w-6 h-6 text-stone-400 shrink-0" />
          </div>
        </div>

        {/* PO Action Flow & Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Supervised active event list */}
          <div className="lg:col-span-2 bg-white border border-stone-205 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-stone-450 tracking-wider">EVENT DALAM PENGAWASAN</h3>
              <Link href="/dashboard/po/events" className="text-xs font-bold text-indigo-650 hover:text-indigo-805 flex items-center gap-0.5">
                Monitor Progress <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {events.filter((e) => e.status !== "Pending Approval").slice(0, 3).map((evt) => (
                <div key={evt.id} className="p-3.5 border border-stone-150 rounded-xl space-y-3 hover:border-stone-250 transition-all" id={`po_super_evt_${evt.id}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                    <span className="text-indigo-700 font-extrabold uppercase">{evt.category}</span>
                    <span className="text-stone-400">{evt.pesertaCount} Mahasiswa</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-850 leading-snug line-clamp-1">{evt.title}</h4>
                  
                  {/* Progress Line */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full bg-stone-100 rounded-full h-1.5 p-[1px]">
                      <div className="bg-indigo-600 rounded-full h-full" style={{ width: `${evt.progress}%` }} />
                    </div>
                    <span className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-widest">{evt.progress}% KELENGKAPAN DIVISI</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Feeds list */}
          <div className="bg-white border border-stone-205 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              LOG NOTIFIKASI PO
            </h3>

            <div className="divide-y divide-stone-100 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {notifications.map((notif) => (
                <div key={notif.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="font-bold text-indigo-700 uppercase tracking-wider">{notif.category}</span>
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
