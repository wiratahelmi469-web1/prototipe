"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Workspace from "../../../components/Workspace";
import { INITIAL_EVENTS, INITIAL_TASKS, DIVISION_PROGRESS, EventItem, TaskItem, DivisionProgress } from "../../../lib/mockData";
import { Calendar, CheckSquare, Layers3, Flame, ScanLine, Award, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export default function PanitiaOverviewDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [divisions, setDivisions] = useState<DivisionProgress[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "panitia") {
      router.push("/login");
      return;
    }

    // Sync / Load events
    const savedEvents = localStorage.getItem("eventhub_events");
    let currentEvents: EventItem[] = [];
    if (savedEvents) {
      try { currentEvents = JSON.parse(savedEvents); } catch (e) { currentEvents = INITIAL_EVENTS; }
    } else {
      localStorage.setItem("eventhub_events", JSON.stringify(INITIAL_EVENTS));
      currentEvents = INITIAL_EVENTS;
    }
    setEvents(currentEvents);

    // Sync / Load tasks
    const savedTasks = localStorage.getItem("eventhub_tasks");
    let currentTasks: TaskItem[] = [];
    if (savedTasks) {
      try { currentTasks = JSON.parse(savedTasks); } catch (e) { currentTasks = INITIAL_TASKS; }
    } else {
      localStorage.setItem("eventhub_tasks", JSON.stringify(INITIAL_TASKS));
      currentTasks = INITIAL_TASKS;
    }
    setTasks(currentTasks);

    setDivisions(DIVISION_PROGRESS);
  }, [user, loading, router]);

  if (loading || !user) return null;

  // Compute stats
  const activeEventsCount = events.filter(e => e.status !== "Selesai" && e.status !== "Pending Approval").length;
  const urgentTasks = tasks.filter(t => t.priority === "High" && t.status !== "done").slice(0, 4);
  const myEvent = events.find(e => e.id === "evt-01") || events[0]; // Seminar Generative AI as primary demo

  return (
    <Workspace id="panitia_dashboard_viewport">
      <div className="space-y-6" id="panitia_layout">
        {/* Top welcome board */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center gap-4.5 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-base border border-indigo-200/50 uppercase">
              {user.name[0]}
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest font-mono">WORKSPACE PANITIA PELAKSANA</p>
              <h2 className="text-base font-black text-stone-900 mt-0.5">Semangat Koordinasi, {user.name.split(" ")[0]}!</h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">Fasilitasi kelancaran rundown, monitor tugas divisi, and lakukan checklist absensi disini.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/dashboard/panitia/scan"
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <ScanLine className="w-4 h-4" />
              Buka Scanner QR
            </Link>
            <Link
              href="/dashboard/panitia/sertifikat"
              className="px-3.5 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/60 text-indigo-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              Kelola Sertifikat
            </Link>
          </div>
        </div>

        {/* Primary Dash Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Active monitored event card */}
            {myEvent && (
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100/60 px-2 py-0.5 rounded-md">
                      MONITOR UTAMA: {myEvent.category}
                    </span>
                    <h3 className="text-sm font-black text-stone-900 mt-1.5">{myEvent.title}</h3>
                  </div>
                  <Link href="/dashboard/panitia/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 transition-colors">
                    Kelola Panel <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Progress Line */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-605 mb-1.5">
                      <span>Progres Kesiapan Sarana</span>
                      <span>{myEvent.progress}%</span>
                    </div>
                    <div className="w-full bg-stone-100 p-[1px] rounded-full h-2">
                      <div className="bg-indigo-600 rounded-full h-full" style={{ width: `${myEvent.progress}%` }} />
                    </div>
                  </div>

                  {/* Info points */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-stone-50/80 p-3.5 rounded-xl border border-stone-105">
                    <div>
                      <span className="text-[10px] text-stone-400 font-extrabold uppercase">Hari &amp; Tanggal</span>
                      <p className="text-xs font-bold text-stone-700 mt-0.5">{formatDate(myEvent.date)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-extrabold uppercase">Aula Pertemuan</span>
                      <p className="text-xs font-bold text-stone-700 mt-0.5">{myEvent.location}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-extrabold uppercase">Siswa Terdaftar</span>
                      <p className="text-xs font-bold text-stone-700 mt-0.5">{myEvent.pesertaCount} Mahasiswa</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Division pipelines progress summary */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-black uppercase text-stone-450 tracking-wider mb-4 flex items-center gap-1.5">
                <Layers3 className="w-4 h-4 text-indigo-500" />
                PEMANTAUAN DIVISI PELAKSANA
              </h3>

              <div className="space-y-4">
                {divisions.map((div) => (
                  <div key={div.name} className="space-y-1" id={`div_prog_${div.name.replace(/\s+/g, "_")}`}>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-stone-800 font-bold">{div.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          div.status === "Lancar" ? "bg-emerald-50 text-emerald-700" :
                          div.status === "Ada Kendala" ? "bg-amber-50 text-amber-700" :
                          "bg-rose-50 text-rose-700"
                        }`}>{div.status}</span>
                        <span className="text-stone-550">{div.progress}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-stone-100 p-[1px] rounded-full h-1.5">
                      <div className={`rounded-full h-full ${
                        div.status === "Lancar" ? "bg-emerald-500" :
                        div.status === "Ada Kendala" ? "bg-amber-500" :
                        "bg-rose-500"
                      }`} style={{ width: `${div.progress}%` }} />
                    </div>
                    <p className="text-[9px] text-stone-400 font-mono">{div.doneCount} selesai • {div.activeCount} tugas tersisa</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Urgent checklist panel */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4" id="urgent_tasks_panel">
            <h3 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-505" />
              TUGAS DIVISI URGENT (HIGH)
            </h3>

            {urgentTasks.length === 0 ? (
              <div className="py-6 text-center text-stone-400 italic text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 animate-pulse" />
                Semua tugas berprioritas tinggi telah selesai dikerjakan!
              </div>
            ) : (
              <div className="space-y-3">
                {urgentTasks.map((tsk) => (
                  <div key={tsk.id} className="p-3 bg-stone-50 border border-stone-150 rounded-xl space-y-1.5" id={`urgent_task_${tsk.id}`}>
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase">
                      <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-rose-650" />
                        {tsk.priority}
                      </span>
                      <span className="text-stone-400">Batas: {tsk.dueDate}</span>
                    </div>
                    <h5 className="text-xs font-bold text-stone-800 leading-snug line-clamp-2">{tsk.title}</h5>
                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-stone-200/50 text-stone-450 font-semibold">
                      <span className="truncate">PIC: {tsk.assignee}</span>
                      <span className="uppercase text-amber-600">{tsk.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/dashboard/panitia/events"
              className="block w-full py-2.5 bg-stone-900 text-white rounded-xl text-center text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              Ubah Status / Drag-Drop Tugas
            </Link>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
