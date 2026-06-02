"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Workspace from "../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../lib/mockData";
import { Landmark, Users, CalendarCheck, Award, TrendingUp, HelpCircle, ArrowRight } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export default function StaffDashboardHome() {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
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
  }, [user, router]);

  if (!user) return null;

  // Global aggregate stats
  const totalRegistrants = events.reduce((acc, evt) => acc + evt.pesertaCount, 0);
  const publishedEvents = events.filter((e) => e.status !== "Pending Approval");

  return (
    <Workspace id="staff_dashboard_main">
      <div className="space-y-6" id="staff_substructure">
        {/* Staff Header Panel */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center gap-4.5 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-extrabold text-base uppercase">
              {user.name[0]}
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest font-mono">PORTAL UTAMA STAF KEMAHASISWAAN</p>
              <h2 className="text-base font-black text-stone-900 mt-0.5">Sistem Pengawasan Universitas Nurul Fikri</h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Ulas laporan statistik tahunan, awasi keaktifan organisasi mahasiswa, and dukung implementasi kredit SKKM.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/dashboard/staff/events"
              className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CalendarCheck className="w-4 h-4" />
              Kalender Universitas
            </Link>
          </div>
        </div>

        {/* Global Statistics Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="staff_global_counters">
          <div className="bg-white border border-stone-205 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">Partisipasi Mahasiswa</span>
              <span className="text-2xl font-black text-indigo-650 font-mono mt-1 block">{totalRegistrants} Alumi/Siswa</span>
              <p className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +15.4% Semester Ini
              </p>
            </div>
            <Users className="w-8 h-8 text-indigo-500" />
          </div>

          <div className="bg-white border border-stone-205 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">Agenda Resmi Publik</span>
              <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{publishedEvents.length} Event</span>
              <p className="text-[10px] text-stone-450 mt-1">Diselenggarakan secara kredibel</p>
            </div>
            <Landmark className="w-8 h-8 text-emerald-500" />
          </div>

          <div className="bg-white border border-stone-205 p-5 rounded-2xl shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">Akumulasi SKKM Rerata</span>
              <span className="text-2xl font-black text-amber-600 font-mono mt-1 block">18 SKKM</span>
              <p className="text-[10px] text-indigo-600 font-bold mt-1">Sertifikat terverifikasi penuh</p>
            </div>
            <Award className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        {/* Staff Table audit reviews */}
        <div className="bg-white border border-stone-205 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-stone-450 tracking-wider">REKAP KEGIATAN KEMAHASISWAAN</h3>
            <Link href="/dashboard/staff/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-805 flex items-center gap-0.5">
              Semua Agenda Kampus <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="py-6 text-center text-stone-400 italic text-xs">Rekap nihil.</p>
          ) : (
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-150">
              {events.map((evt) => (
                <div key={evt.id} className="p-4 bg-white hover:bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors" id={`staff_row_evt_${evt.id}`}>
                  <div>
                    <div className="flex items-center gap-2 text-[9px] font-bold font-mono">
                      <span className="text-indigo-700 uppercase">{evt.category}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-stone-400">{evt.status}</span>
                    </div>
                    <h5 className="text-xs font-bold text-stone-850 mt-1">{evt.title}</h5>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">Penyelenggara: {evt.organizer} • Aula: {evt.location}</p>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <span className="text-xs font-bold text-stone-705 font-mono block">
                      {evt.pesertaCount} Kehadiran Mhs
                    </span>
                    <span className="text-[9px] text-stone-400 block font-mono">Diperbaharui: {formatDate(evt.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Workspace>
  );
}
