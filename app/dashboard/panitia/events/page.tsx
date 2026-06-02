"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, INITIAL_TASKS, INITIAL_RUNDOWN, INITIAL_CHATS, EventItem, TaskItem, RundownItem, ChatMessage } from "../../../../lib/mockData";
import { Plus, ListCollapse, MessageSquare, ClipboardList, PenTool, CheckCircle, ArrowRight, Trash2, Calendar, MapPin, User, ChevronRight, ChevronLeft, Sparkles, Send } from "lucide-react";
import { formatDate } from "../../../../lib/utils";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function PanitiaEventsManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Core syncing states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [rundowns, setRundowns] = useState<RundownItem[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);

  // Selection states
  const [activeEventId, setActiveEventId] = useState("evt-01");
  const [activeTab, setActiveTab] = useState<"tasks" | "rundown" | "chat" | "create">("tasks");

  // Input states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const [newRundownTitle, setNewRundownTitle] = useState("");
  const [newRundownPic, setNewRundownPic] = useState("");
  const [newRundownTime, setNewRundownTime] = useState("");
  const [newRundownLocation, setNewRundownLocation] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // AI advisory for rundown description
  const [aiGenerating, setAiGenerating] = useState(false);

  // New Event Form State
  const [evtTitle, setEvtTitle] = useState("");
  const [evtCategory, setEvtCategory] = useState<"Seminar" | "Workshop" | "Lomba" | "Olahraga" | "Seni" | "Sosial">("Seminar");
  const [evtDate, setEvtDate] = useState("");
  const [evtLocation, setEvtLocation] = useState("");
  const [evtDesc, setEvtDesc] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "panitia") {
      router.push("/login");
      return;
    }

    // Load Events list
    const savedEvents = localStorage.getItem("eventhub_events");
    let currentEvts: EventItem[] = [];
    if (savedEvents) {
      try { currentEvts = JSON.parse(savedEvents); } catch (e) { currentEvts = INITIAL_EVENTS; }
    } else {
      currentEvts = INITIAL_EVENTS;
      localStorage.setItem("eventhub_events", JSON.stringify(INITIAL_EVENTS));
    }
    setEvents(currentEvts);

    // Load Tasks
    const savedTasks = localStorage.getItem("eventhub_tasks");
    let currentTsks: TaskItem[] = [];
    if (savedTasks) {
      try { currentTsks = JSON.parse(savedTasks); } catch (e) { currentTsks = INITIAL_TASKS; }
    } else {
      currentTsks = INITIAL_TASKS;
      localStorage.setItem("eventhub_tasks", JSON.stringify(INITIAL_TASKS));
    }
    setTasks(currentTsks);

    // Load Rundown
    const savedRundowns = localStorage.getItem("eventhub_rundowns");
    let currentRdns: RundownItem[] = [];
    if (savedRundowns) {
      try { currentRdns = JSON.parse(savedRundowns); } catch (e) { currentRdns = INITIAL_RUNDOWN; }
    } else {
      currentRdns = INITIAL_RUNDOWN;
      localStorage.setItem("eventhub_rundowns", JSON.stringify(INITIAL_RUNDOWN));
    }
    setRundowns(currentRdns);

    // Load Chats
    const savedChats = localStorage.getItem("eventhub_chats");
    let currentChats: ChatMessage[] = [];
    if (savedChats) {
      try { currentChats = JSON.parse(savedChats); } catch (e) { currentChats = INITIAL_CHATS; }
    } else {
      currentChats = INITIAL_CHATS.map((c) => ({ ...c, isMe: c.sender === user.name }));
      localStorage.setItem("eventhub_chats", JSON.stringify(currentChats));
    }
    setChats(currentChats);

  }, [user, loading, router]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper selectors
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];
  const activeEventTasks = tasks.filter((t) => t.eventId === activeEventId);
  const activeEventRundowns = rundowns.filter((r) => r.eventId === activeEventId);
  const activeEventChats = chats.filter((c) => c.eventId === activeEventId);

  // Kanban task status updating
  const handleMoveTask = (taskId: string, targetStatus: "todo" | "progress" | "done") => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t));
    localStorage.setItem("eventhub_tasks", JSON.stringify(updated));
    setTasks(updated);
    addToast("Status tugas berhasil diperbarui!", "success");
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    localStorage.setItem("eventhub_tasks", JSON.stringify(updated));
    setTasks(updated);
    addToast("Tugas berhasil dihapus.", "info");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      eventId: activeEventId,
      title: newTaskTitle,
      assignee: newTaskAssignee || "Tanpa PIC",
      priority: newTaskPriority,
      status: "todo",
      dueDate: activeEvent ? activeEvent.date : "2026-06-15"
    };

    const updated = [newTask, ...tasks];
    localStorage.setItem("eventhub_tasks", JSON.stringify(updated));
    setTasks(updated);

    setNewTaskTitle("");
    setNewTaskAssignee("");
    addToast("Tugas baru ditambahkan ke kolom To-Do!", "success");
  };

  // Rundown Actions
  const handleAddRundown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRundownTitle.trim()) return;

    const [start, end] = newRundownTime.split("-");

    const newRundown: RundownItem = {
      id: `rdn-${Date.now()}`,
      eventId: activeEventId,
      timeStart: start?.trim() || "09:00",
      timeEnd: end?.trim() || "10:00",
      title: newRundownTitle,
      pic: newRundownPic || "Panitia",
      location: newRundownLocation || activeEvent.location,
      isLive: false,
      isCompleted: false
    };

    const updated = [...rundowns, newRundown];
    localStorage.setItem("eventhub_rundowns", JSON.stringify(updated));
    setRundowns(updated);

    setNewRundownTitle("");
    setNewRundownPic("");
    setNewRundownTime("");
    setNewRundownLocation("");
    addToast("Rundown sukses dijadwalkan!", "success");
  };

  const handleDeleteRundown = (rdnId: string) => {
    const updated = rundowns.filter((r) => r.id !== rdnId);
    localStorage.setItem("eventhub_rundowns", JSON.stringify(updated));
    setRundowns(updated);
    addToast("Sesi rundown terhapus.", "info");
  };

  // Divisi chat messenger
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      eventId: activeEventId,
      sender: user?.name || "Panitia",
      role: "Panitia",
      isMe: true,
      message: chatInput,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };

    const updated = [...chats, newMsg];
    localStorage.setItem("eventhub_chats", JSON.stringify(updated));
    setChats(updated);
    setChatInput("");
  };

  // CRUD create new event
  const handleCreateNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim() || !evtDate) return;

    const newEvt: EventItem = {
      id: `evt-${Math.floor(100 + Math.random() * 900)}`,
      title: evtTitle,
      category: evtCategory,
      date: evtDate,
      time: "09:00 - 12:00 WIB",
      location: evtLocation || "Kampus Terpadu",
      description: evtDesc || "Deskripsi rujukan kegiatan.",
      organizer: "HMIF Universitas Nurul Fikri",
      isOnline: false,
      status: "Pending Approval", // Needs PO authorization
      progress: 10,
      pesertaCount: 0,
      urgentTasksCount: 2,
      coordinator: user?.name || "Panitia"
    };

    const updated = [newEvt, ...events];
    localStorage.setItem("eventhub_events", JSON.stringify(updated));
    setEvents(updated);

    // Initial tasks for the new event
    const generatedTasks: TaskItem[] = [
      { id: `tsk-${Date.now()}-1`, eventId: newEvt.id, title: "Booking perizinan auditorium & sarpras", priority: "High", dueDate: evtDate, assignee: user?.name || "Panitia", status: "todo" },
      { id: `tsk-${Date.now()}-2`, eventId: newEvt.id, title: "Finalisasi poster & broadcast pendaftaran", priority: "Medium", dueDate: evtDate, assignee: "Humas Div", status: "todo" }
    ];
    const updatedTasks = [...generatedTasks, ...tasks];
    localStorage.setItem("eventhub_tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);

    // Push notification to PO about new event pending approval
    const savedNotifs = localStorage.getItem("eventhub_notifications");
    let globalNotifs: any[] = [];
    if (savedNotifs) {
      try { globalNotifs = JSON.parse(savedNotifs); } catch (e) { }
    }
    const newNotif = {
      id: `notif-${Date.now()}`,
      category: "Persetujuan",
      title: `Event Diajukan: ${evtTitle}`,
      description: `Panitia ${user?.name} baru saja mengajukan event '${evtTitle}' untuk diperiksa.`,
      timestamp: new Date().toISOString(),
      isUnread: true,
      hasQuickAction: true,
      visibility: ["po"]
    };
    localStorage.setItem("eventhub_notifications", JSON.stringify([newNotif, ...globalNotifs]));

    addToast(`Pengajuan event '${evtTitle}' berhasil dikirim ke PO untuk evaluasi!`, "success");
    setActiveEventId(newEvt.id);
    setActiveTab("tasks");

    // reset fields
    setEvtTitle("");
    setEvtLocation("");
    setEvtDesc("");
  };

  // AI descriptor helper
  const handleAIEnhanceDescription = async () => {
    if (!evtTitle.trim()) {
      addToast("Isi judul event terlebih dahulu sebelum mengisi deskripsi via AI.", "info");
      return;
    }
    setAiGenerating(true);
    addToast("Merancang deskripsi memukau bersama Gemini...", "info");

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Tulis deskripsi promosi pendaftaran singkat (maksimal 70 kata) untuk event fakultas bernama: ${evtTitle} dengan kategori ${evtCategory} di Universitas Nurul Fikri. Buat bahasanya santun, bermotivasi tinggi, dan ramah.`
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvtDesc(data.text);
        addToast("Deskripsi sukses ditingkatkan oleh Gemini!", "success");
      }
    } catch (e) {
      addToast("Asisten AI sedang sibuk.", "error");
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading || !user) return null;

  return (
    <Workspace id="panitia_events_manager_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="panitia_events_grid">
        {/* Left column: Event selection bar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4.5 shadow-xs space-y-3 lg:col-span-1">
          <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider">PILIH EVENT KOORDINASI</p>
          <div className="space-y-1.5 max-h-[300px] lg:max-h-[500px] overflow-y-auto custom-scrollbar">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setActiveEventId(e.id);
                  if (activeTab === "create") setActiveTab("tasks");
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                  activeEventId === e.id
                    ? "bg-indigo-600 border-indigo-700 text-white"
                    : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700"
                }`}
                id={`event_btn_${e.id}`}
              >
                <div className="flex justify-between items-center text-[8px] font-extrabold uppercase font-mono mb-1">
                  <span>{e.category}</span>
                  <span className={activeEventId === e.id ? "text-indigo-200" : "text-stone-400"}>
                    {e.status}
                  </span>
                </div>
                <h4 className="font-bold line-clamp-1 leading-snug">{e.title}</h4>
                <p className={`text-[9px] mt-1 font-mono ${activeEventId === e.id ? "text-indigo-200" : "text-stone-400"}`}>
                  {e.pesertaCount} Terdaftar
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab("create")}
            className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            Ajukan Event Baru
          </button>
        </div>

        {/* Right column: Tab view content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab !== "create" && activeEvent && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-100 pb-4 gap-4">
                <div>
                  <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 uppercase font-mono">
                    PANEL EVENT: {activeEvent.category}
                  </span>
                  <h2 className="text-base font-black text-stone-900 mt-1">{activeEvent.title}</h2>
                </div>

                {/* Tabs selection triggers */}
                <div className="flex rounded-xl bg-stone-100 p-0.5" id="events_tabs">
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "tasks" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Tugas (Kanban)
                  </button>
                  <button
                    onClick={() => setActiveTab("rundown")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "rundown" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Rundown
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "chat" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Chat Divisi
                  </button>
                </div>
              </div>

              {/* TABS CONTAINER 1: KANBAN BOARD */}
              {activeTab === "tasks" && (
                <div className="space-y-6 mt-5" id="kanban_tab_content">
                  {/* Task summary */}
                  <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-stone-50 p-4 border border-stone-200 rounded-2xl">
                    <div className="col-span-1 md:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Nama tugas divisi baru..."
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl py-2 px-3 pl-4 outline-hidden"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Assignee / Divisi..."
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl py-2 px-3 outline-hidden"
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Beri Tugas &rarr;
                    </button>
                  </form>

                  {/* Kanban lanes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* TO DO column */}
                    <div className="bg-stone-50/70 border border-stone-200 p-4 rounded-2xl space-y-3 min-h-[250px]" id="todo_lane">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-stone-800 uppercase tracking-wide">TO-DO</span>
                        <span className="bg-stone-250 text-stone-700 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {activeEventTasks.filter((t) => t.status === "todo").length}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {activeEventTasks.filter((t) => t.status === "todo").map((t) => (
                          <div key={t.id} className="bg-white border border-stone-200 p-3.5 rounded-xl shadow-xs space-y-2 relative group" id={`kanban_task_${t.id}`}>
                            <h5 className="text-xs font-bold text-stone-850 line-clamp-2 leading-snug">{t.title}</h5>
                            <div className="flex justify-between items-center text-[9px] pt-2 border-t border-stone-100 font-bold">
                              <span className="text-stone-450 uppercase">{t.assignee}</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleMoveTask(t.id, "progress")}
                                  className="p-1 hover:bg-stone-100 text-indigo-700 font-bold"
                                  title="Mulai Tugas"
                                >
                                  Mulai &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PROGRESS column */}
                    <div className="bg-amber-50/30 border border-stone-200 p-4 rounded-2xl space-y-3 min-h-[250px]" id="progress_lane">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-stone-800 uppercase tracking-wide">PROGRESS</span>
                        <span className="bg-amber-100 text-amber-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {activeEventTasks.filter((t) => t.status === "progress").length}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {activeEventTasks.filter((t) => t.status === "progress").map((t) => (
                          <div key={t.id} className="bg-white border border-stone-200 p-3.5 rounded-xl shadow-xs space-y-2 relative group" id={`kanban_task_${t.id}`}>
                            <h5 className="text-xs font-bold text-stone-850 line-clamp-2 leading-snug">{t.title}</h5>
                            <div className="flex justify-between items-center text-[9px] pt-2 border-t border-stone-100 font-bold">
                              <span className="text-stone-450 uppercase">{t.assignee}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMoveTask(t.id, "todo")}
                                  className="text-stone-400 hover:text-stone-750"
                                >
                                  &larr; ToDo
                                </button>
                                <button
                                  onClick={() => handleMoveTask(t.id, "done")}
                                  className="text-emerald-750 font-bold"
                                >
                                  Done &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DONE column */}
                    <div className="bg-emerald-50/25 border border-stone-200 p-4 rounded-2xl space-y-3 min-h-[250px]" id="done_lane">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-stone-800 uppercase tracking-wide">DONE</span>
                        <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {activeEventTasks.filter((t) => t.status === "done").length}
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {activeEventTasks.filter((t) => t.status === "done").map((t) => (
                          <div key={t.id} className="bg-white border border-stone-150 p-3.5 rounded-xl shadow-xs space-y-2 relative group" id={`kanban_task_${t.id}`}>
                            <h5 className="text-xs font-bold text-stone-800 line-clamp-2 leading-snug line-through opacity-70">{t.title}</h5>
                            <div className="flex justify-between items-center text-[9px] pt-2 border-t border-stone-100 font-bold">
                              <span className="text-stone-450 uppercase">{t.assignee}</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleDeleteTask(t.id)}
                                  className="text-rose-600 hover:text-rose-800"
                                >
                                  Hapus
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TABS CONTAINER 2: RUNDOWN CHANGER */}
              {activeTab === "rundown" && (
                <div className="space-y-5 mt-5">
                  <form onSubmit={handleAddRundown} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-stone-50 border border-stone-200 p-4 rounded-2xl">
                    <div className="col-span-1 md:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Nama agenda (Contoh: Sesi I: Membuka Acara)..."
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl py-2 px-3 outline-hidden"
                        value={newRundownTitle}
                        onChange={(e) => setNewRundownTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="PIC Divisi/Pembawa..."
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl py-2 px-3 outline-hidden"
                        value={newRundownPic}
                        onChange={(e) => setNewRundownPic(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Jam (Misal: 09:00 - 10:15)..."
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl py-2 px-3 outline-hidden"
                        value={newRundownTime}
                        onChange={(e) => setNewRundownTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Lokasi Sektor..."
                        className="w-full text-xs bg-white border border-stone-200 rounded-xl py-2 px-3 outline-hidden"
                        value={newRundownLocation}
                        onChange={(e) => setNewRundownLocation(e.target.value)}
                      />
                    </div>
                    <div className="col-span-full text-right">
                      <button
                        type="submit"
                        className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Tambah Sesi Rundown
                      </button>
                    </div>
                  </form>

                  {/* List of active rundown items */}
                  <div className="border border-stone-205 rounded-2xl overflow-hidden divide-y divide-stone-150">
                    {activeEventRundowns.length === 0 ? (
                      <p className="p-8 text-center text-stone-400 text-xs italic">Belum ada rundown terdaftar.</p>
                    ) : (
                      activeEventRundowns.map((r) => (
                        <div key={r.id} className="p-4 bg-white hover:bg-stone-50 flex items-center justify-between gap-4 transition-colors" id={`run_row_${r.id}`}>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-indigo-700 font-mono">{r.timeStart} - {r.timeEnd} WIB</span>
                            <h5 className="text-xs font-bold text-stone-850">{r.title}</h5>
                            <p className="text-[9px] text-stone-400 font-mono">PIC: <span className="font-semibold text-stone-650">{r.pic}</span> • Sektor: {r.location}</p>
                          </div>

                          <button
                            onClick={() => handleDeleteRundown(r.id)}
                            className="p-2 bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 rounded-xl transition-all"
                            title="Hapus Agenda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TABS CONTAINER 3: CHAT ROOMS */}
              {activeTab === "chat" && (
                <div className="space-y-4 mt-5">
                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 h-[300px] overflow-y-auto space-y-3.5 flex flex-col custom-scrollbar" id="divisi_chat_window">
                    {activeEventChats.length === 0 ? (
                      <p className="text-center text-stone-400 italic text-xs my-auto">Grup diskusi kosong. Mulai obrolan penyemangat disini!</p>
                    ) : (
                      activeEventChats.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            msg.isMe ? "self-end items-end" : "self-start items-start"
                          }`}
                          id={`chat_msg_${msg.id}`}
                        >
                          <span className="text-[9px] font-extrabold text-stone-400 tracking-wide font-mono px-1">
                            {msg.sender} ({msg.role})
                          </span>
                          <div className={`p-3 rounded-2xl text-[11px] font-semibold mt-1 shadow-2xs leading-relaxed ${
                            msg.isMe ? "bg-indigo-600 text-white rounded-tr-xs" : "bg-white border border-stone-150 text-stone-800 rounded-tl-xs"
                          }`}>
                            {msg.message}
                          </div>
                          <span className="text-[8px] text-stone-400 mt-0.5 px-1 font-mono">{msg.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ketik koordinasi divisi baru..."
                      className="flex-1 text-xs bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 outline-hidden focus:border-indigo-500 font-semibold text-stone-800"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TABS CONTAINER 4: CREATE EVENT */}
          {activeTab === "create" && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-5" id="create_event_form">
              <div>
                <h3 className="text-xs font-black uppercase text-stone-450 tracking-wider">AJUKAN TARGET KEGIATAN BARU</h3>
                <p className="text-xs text-stone-500 mt-0.5">Event yang diajukan akan berstatus Pending Approval sampai disetujui Project Officer.</p>
              </div>

              <form onSubmit={handleCreateNewEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form_title" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Judul Kegiatan</label>
                    <input
                      id="form_title"
                      type="text"
                      required
                      placeholder="Seminar Inovasi Teknologi Generasi..."
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-800"
                      value={evtTitle}
                      onChange={(e) => setEvtTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="form_category" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Kategori Kegiatan</label>
                    <select
                      id="form_category"
                      value={evtCategory}
                      onChange={(e) => setEvtCategory(e.target.value as any)}
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-800 cursor-pointer"
                    >
                      <option value="Seminar">Seminar</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Lomba">Lomba / Kompetisi</option>
                      <option value="Olahraga">Olahraga</option>
                      <option value="Seni">Seni / Kreasi</option>
                      <option value="Sosial">Aksi Sosial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="form_date" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Hari &amp; Tanggal Kegiatan</label>
                    <input
                      id="form_date"
                      type="date"
                      required
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-800"
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="form_loc" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Rencana Ruang / Lokasi Kampus</label>
                    <input
                      id="form_loc"
                      type="text"
                      placeholder="Aula Rektorat Lt 4..."
                      className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-800"
                      value={evtLocation}
                      onChange={(e) => setEvtLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="form_desc" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Deskripsi Promosi Kegiatan</label>
                    <button
                      type="button"
                      disabled={aiGenerating}
                      onClick={handleAIEnhanceDescription}
                      className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-405" />
                      Tingkatkan dengan Gemini AI
                    </button>
                  </div>
                  <textarea
                    id="form_desc"
                    rows={4}
                    placeholder="Tuliskan latar belakang, benefit, pembicara..."
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-semibold text-stone-800"
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  id="final_create_evt_btn"
                >
                  Ajukan Proposal Event Sekarang &rarr;
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Workspace>
  );
}
