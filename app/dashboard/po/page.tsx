"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import Workspace from "../../../components/Workspace";
import { EventItem, NotificationItem } from "../../../lib/mockData";
import { 
  getEvents, 
  saveEvents, 
  getBudgetItems, 
  saveBudgetItems, 
  getActivityLogs, 
  addActivityLog, 
  getNotifications, 
  addNotification,
  BudgetItem,
  ActivityLog
} from "../../../lib/budgetService";
import { 
  CalendarDays, 
  Hourglass, 
  Users, 
  Award, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  FileCheck, 
  FileText, 
  Edit3, 
  ArrowRight, 
  X, 
  Upload, 
  Clock, 
  Send,
  Eye,
  Info
} from "lucide-react";
import { formatDate } from "../../../lib/utils";
import Toast, { ToastContainer } from "../../../components/Toast";

export default function PODashboardHome() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Core lists
  const [events, setEvents] = useState<EventItem[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  // Selected event for deep inspect modal / subpanel
  const [selectedEvt, setSelectedEvt] = useState<EventItem | null>(null);

  // New Event form fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"Seminar" | "Workshop" | "Lomba" | "Olahraga" | "Seni" | "Sosial">("Seminar");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:00 - 12:00 WIB");
  const [formLocation, setFormLocation] = useState("");
  const [formOrganization, setFormOrganization] = useState("Himpunan Mahasiswa");
  const [formDesc, setFormDesc] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formPOnote, setFormPOnote] = useState("");
  const [docName, setDocName] = useState("");
  
  // New Event temporary budget items in state before submitting
  const [tempBudgets, setTempBudgets] = useState<{
    itemName: string;
    category: "konsumsi" | "perlengkapan" | "transportasi" | "akomodasi" | "dokumentasi" | "lainnya";
    qty: number;
    unitPrice: number;
    poNote: string;
  }[]>([]);

  // Individual new budget item inputs
  const [bItemName, setBItemName] = useState("");
  const [bCategory, setBCategory] = useState<"konsumsi" | "perlengkapan" | "transportasi" | "akomodasi" | "dokumentasi" | "lainnya">("konsumsi");
  const [bQty, setBQty] = useState<number>(1);
  const [bUnitPrice, setBUnitPrice] = useState<number>(10000);
  const [bNote, setBNote] = useState("");

  // Edit active event fields (inside inspector)
  const [inspectEditMode, setInspectEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPurpose, setEditPurpose] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");

  // Budget editing in inspector
  const [insBItemName, setInsBItemName] = useState("");
  const [insBCategory, setInsBCategory] = useState<"konsumsi" | "perlengkapan" | "transportasi" | "akomodasi" | "dokumentasi" | "lainnya">("konsumsi");
  const [insBQty, setInsBQty] = useState<number>(1);
  const [insBUnitPrice, setInsBUnitPrice] = useState<number>(10000);
  const [insBNote, setInsBNote] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "po") {
      router.push("/login");
      return;
    }

    refreshData();
  }, [user, loading, router]);

  const refreshData = () => {
    const list = getEvents();
    const bgts = getBudgetItems();
    const lgs = getActivityLogs();
    const nots = getNotifications();

    setEvents(list);
    setBudgetItems(bgts);
    setActivityLogs(lgs);
    setNotifications(nots.filter((n) => n.visibility.includes("po")));
  };

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add temp budget item to form list
  const addTempBudget = () => {
    if (!bItemName.trim()) {
      addToast("Nama item anggaran wajib diisi", "error");
      return;
    }
    setTempBudgets((prev) => [
      ...prev,
      {
        itemName: bItemName,
        category: bCategory,
        qty: bQty <= 0 ? 1 : bQty,
        unitPrice: bUnitPrice <= 0 ? 0 : bUnitPrice,
        poNote: bNote
      }
    ]);
    // Reset individual budget inputs
    setBItemName("");
    setBQty(1);
    setBUnitPrice(10000);
    setBNote("");
    addToast("Item anggaran ditambahkan ke draf pengajuan!", "success");
  };

  const removeTempBudget = (idx: number) => {
    setTempBudgets((prev) => prev.filter((_, i) => i !== idx));
    addToast("Item anggaran dihapus dari draf.", "info");
  };

  // Create Event action
  const handleCreateEvent = (status: "Draft" | "Submitted") => {
    if (!formTitle.trim()) {
      addToast("Judul event wajib diisi!", "error");
      return;
    }
    if (!formDate) {
      addToast("Tanggal kegiatan wajib ditentukan!", "error");
      return;
    }

    const newEventId = `evt-${Math.floor(100 + Math.random() * 900)}`;
    const newEvent: EventItem = {
      id: newEventId,
      title: formTitle,
      category: formCategory,
      date: formDate,
      time: formTime || "09:00 - 12:00 WIB",
      location: formLocation || "Kampus Terpadu NF",
      description: formDesc || "Deskripsi event perkuliahan.",
      organizer: formOrganization || "HMJ Universitas Nurul Fikri",
      isOnline: false,
      status: status, // "Draft" or "Submitted"
      progress: 10,
      pesertaCount: 0,
      urgentTasksCount: 0,
      coordinator: user?.name || "Rudi Hartono (PO)"
    };

    // Inject custom properties mapping
    const customEvent = {
      ...newEvent,
      purpose: formPurpose || "Pengembangan kompetensi dan relasi mahasiswa.",
      po_id: user?.email || "po@nurulfikri.ac.id",
      submitted_at: status === "Submitted" ? new Date().toISOString() : ""
    };

    // Save event
    const updatedEvents = [customEvent, ...events];
    saveEvents(updatedEvents);

    // Save budget items for this event
    const globalBudgets = getBudgetItems();
    const mappedBudgets: BudgetItem[] = tempBudgets.map((b, i) => ({
      id: `bgt-${newEventId}-${Date.now()}-${i}`,
      eventId: newEventId,
      itemName: b.itemName,
      category: b.category,
      qty: b.qty,
      unitPrice: b.unitPrice,
      totalPrice: b.qty * b.unitPrice,
      status: "Pending Review" as const,
      poNote: b.poNote,
      reviewerNote: ""
    }));

    saveBudgetItems([...mappedBudgets, ...globalBudgets]);

    // Save activity logs
    addActivityLog(
      newEventId, 
      user?.email || "po@nurulfikri.ac.id", 
      user?.name || "Rudi Hartono (PO)",
      "Event dibuat", 
      status === "Submitted" ? "Event dibuat dan segera diajukan ke Kemahasiswaan." : "Event dibuat sebagai draf."
    );

    if (status === "Submitted") {
      addNotification(
        "Persetujuan",
        `Review Event Baru: ${formTitle}`,
        `PO ${user?.name} baru saja mengajukan proposal event '${formTitle}' beserta rincian anggarannya.`,
        ["staff"]
      );
      addToast("Event dan rincian anggaran sukses disubmit ke Kemahasiswaan!", "success");
    } else {
      addToast("Event sukses distore sebagai draf.", "success");
    }

    // Reset Form
    setFormTitle("");
    setFormDate("");
    setFormLocation("");
    setFormDesc("");
    setFormPurpose("");
    setFormPOnote("");
    setTempBudgets([]);
    setActiveTab("list");
    refreshData();
  };

  // Status utility helpers
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-stone-100 text-stone-700 border border-stone-200";
      case "Submitted":
        return "bg-blue-105 bg-blue-50 text-blue-700 border border-blue-200";
      case "Under Review":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Revision Requested":
        return "bg-yellow-50 text-yellow-800 border border-yellow-250";
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-250";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border border-rose-250";
      default:
        return "bg-stone-105 text-stone-600";
    }
  };

  // Open Inspector
  const openInspector = (evt: EventItem) => {
    setSelectedEvt(evt);
    setEditTitle(evt.title);
    setEditDesc(evt.description);
    setEditPurpose((evt as any).purpose || "");
    setEditLocation(evt.location);
    setEditDate(evt.date);
    setInspectEditMode(false);
  };

  // Add budget item during revision/editing state
  const handleAddBudgetInInspector = () => {
    if (!selectedEvt) return;
    if (!insBItemName.trim()) {
      addToast("Nama item anggaran wajib diisi", "error");
      return;
    }

    const newItem: BudgetItem = {
      id: `bgt-${selectedEvt.id}-${Date.now()}`,
      eventId: selectedEvt.id,
      itemName: insBItemName,
      category: insBCategory,
      qty: insBQty <= 0 ? 1 : insBQty,
      unitPrice: insBUnitPrice <= 0 ? 0 : insBUnitPrice,
      totalPrice: insBQty * insBUnitPrice,
      status: "Pending Review",
      poNote: insBNote,
      reviewerNote: ""
    };

    const globalBudgets = getBudgetItems();
    saveBudgetItems([newItem, ...globalBudgets]);
    refreshData();

    // Reset inputs
    setInsBItemName("");
    setInsBQty(1);
    setInsBUnitPrice(10000);
    setInsBNote("");
    addToast("Item anggaran baru berhasil ditambahkan!", "success");
  };

  // Delete budget item during draft/revision state
  const handleDeleteBudgetInInspector = (id: string, name: string) => {
    const globalBudgets = getBudgetItems();
    const filtered = globalBudgets.filter((b) => b.id !== id);
    saveBudgetItems(filtered);
    refreshData();
    addToast(`Sukses mendelete anggaran '${name}'!`, "info");
  };

  // Resubmit event after revision
  const handleResubmitEvent = () => {
    if (!selectedEvt) return;

    // Update status in global lists
    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvt.id) {
        return {
          ...e,
          title: editTitle,
          description: editDesc,
          purpose: editPurpose,
          location: editLocation,
          date: editDate,
          status: "Submitted" as const,
          submitted_at: new Date().toISOString()
        };
      }
      return e;
    });

    saveEvents(updatedEvents);

    // Also update current active budget items to 'Pending Review' so Staf can re-review them
    const globalBudgets = getBudgetItems();
    const resetBudgets = globalBudgets.map((b) => {
      if (b.eventId === selectedEvt.id) {
        return {
          ...b,
          status: "Pending Review" as const
        };
      }
      return b;
    });
    saveBudgetItems(resetBudgets);

    // Logging
    addActivityLog(
      selectedEvt.id, 
      user?.email || "po@nurulfikri.ac.id", 
      user?.name || "Rudi Hartono (PO)", 
      "Event diajukan ulang", 
      "Pengajuan disubmit kembali setelah revisi/pembenahan proposal."
    );

    addNotification(
      "Persetujuan",
      `Event Resubmitted: ${selectedEvt.title}`,
      `PO telah merubah dan mengajukan ulang event '${selectedEvt.title}' beserta pembaharuan anggarannya.`,
      ["staff"]
    );

    addToast(`Sukses menyubmit ulang proposal event '${selectedEvt.title}'!`, "success");
    setSelectedEvt(null);
    refreshData();
  };

  // Safe save as Draft only
  const handleSaveDraftChanges = () => {
    if (!selectedEvt) return;

    const updatedEvents = events.map((e) => {
      if (e.id === selectedEvt.id) {
        return {
          ...e,
          title: editTitle,
          description: editDesc,
          purpose: editPurpose,
          location: editLocation,
          date: editDate
        };
      }
      return e;
    });

    saveEvents(updatedEvents);
    addActivityLog(
      selectedEvt.id, 
      user?.email || "po@nurulfikri.ac.id", 
      user?.name || "Rudi Hartono (PO)", 
      "Draft diupdate", 
      "Perubahan konten draft berhasil didata."
    );

    addToast("Draf berhasil disimpan lokal.", "success");
    setInspectEditMode(false);
    refreshData();
  };

  const getEventBudgets = (evtId: string) => {
    return budgetItems.filter((b) => b.eventId === evtId);
  };

  const getEventLogs = (evtId: string) => {
    return activityLogs.filter((l) => l.eventId === evtId);
  };

  const calculateSumBudget = (evtId: string) => {
    return getEventBudgets(evtId).reduce((acc, b) => acc + b.totalPrice, 0);
  };

  if (loading || !user) return null;

  // Aggregate metrics
  const myEvents = events.filter((e) => (e as any).po_id === user.email);
  const totalMyBudgets = myEvents.reduce((acc, e) => acc + calculateSumBudget(e.id), 0);
  const pendingReviewCount = myEvents.filter((e) => e.status === "Submitted" || e.status === "Under Review").length;
  const approvedCount = myEvents.filter((e) => e.status === "Approved").length;
  const revisionCount = myEvents.filter((e) => e.status === "Revision Requested").length;

  return (
    <Workspace id="po_dashboard_canvas">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="space-y-6" id="po_home_substructure">
        {/* PO Header Board */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center gap-4.5 justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center font-extrabold text-base uppercase shrink-0">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest font-mono">PANEL PENGAJUAN ORGANISASI (PO)</p>
              <h2 className="text-base font-black text-stone-900 mt-0.5 truncate">Selamat datang, {user.name}!</h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed truncate">
                Rancang event kemahasiswaan, rincikan anggaran belanja, dan kirimkan langsung ke Staf Kemahasiswaan.
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab(activeTab === "list" ? "create" : "list");
                setSelectedEvt(null);
              }}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              {activeTab === "list" ? (
                <>
                  <Plus className="w-4 h-4" />
                  Buat Pengajuan Baru
                </>
              ) : (
                "Kembali ke Daftar Event"
              )}
            </button>
          </div>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="po_sc_indicators">
          <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Menunggu Review</span>
              <span className="text-base font-black text-blue-600 font-mono block">{pendingReviewCount} Event</span>
            </div>
            <Hourglass className="w-5 h-5 text-blue-500 shrink-0 hidden sm:block" />
          </div>

          <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Disetujui</span>
              <span className="text-base font-black text-emerald-600 font-mono block">{approvedCount} Event</span>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 hidden sm:block" />
          </div>

          <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Revisi Diminta</span>
              <span className="text-base font-black text-amber-600 font-mono block">{revisionCount} Event</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 hidden sm:block" />
          </div>

          <div className="bg-white border border-stone-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Total Pengajuan</span>
              <span className="text-base font-black text-stone-800 font-mono block">Rp {totalMyBudgets.toLocaleString("id-ID")}</span>
            </div>
            <FileText className="w-5 h-5 text-stone-400 shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* Tab List */}
        {activeTab === "list" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="po_main_grid">
            {/* My Proposed Events Table */}
            <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase text-stone-450 tracking-wider">EVENT SAYA</h3>

              {myEvents.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-stone-100 rounded-xl">
                  <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-400 italic">Belum ada pengajuan event. Klik tombol di kanan atas untuk mengusulkan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50/50">
                        <th className="py-3 px-3">Nama Event</th>
                        <th className="py-3 px-3">Tanggal</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Total Anggaran</th>
                        <th className="py-3 px-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                      {myEvents.map((e) => (
                        <tr key={e.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-stone-900">
                            <div>{e.title}</div>
                            <div className="text-[9px] text-stone-400 font-mono font-bold uppercase">{e.category} • {e.organizer}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px]">{e.date}</td>
                          <td className="py-3 px-3">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadgeClass(e.status)}`}>
                              {e.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-stone-900">
                            Rp {calculateSumBudget(e.id).toLocaleString("id-ID")}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => openInspector(e)}
                              className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg text-[10px] font-bold text-stone-800 cursor-pointer transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Detail / Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notification and Log Panel */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
              <h3 className="text-xs font-black uppercase text-stone-450 tracking-wider">LOG NOTIFIKASI PENGULASAN</h3>
              
              <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs italic text-stone-400">Belum ada tanggapan review masuk.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex justify-between items-center text-[8px] font-mono font-bold">
                        <span className="text-indigo-600 uppercase">{notif.category}</span>
                        <span className="text-stone-400">{formatDate(notif.timestamp)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-800 leading-snug">{notif.title}</h4>
                      <p className="text-[10px] text-stone-500 leading-relaxed font-medium">{notif.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROPOSE EVENT STATE FORM */}
        {activeTab === "create" && (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs max-w-4xl mx-auto space-y-6" id="po_create_panel">
            <div>
              <h3 className="text-sm font-black text-stone-900 uppercase">Formulir Pengajuan Event &amp; Anggaran Baru</h3>
              <p className="text-xs text-stone-400 mt-0.5">Rancang detail draf proposal event Anda beserta rincian belanja item per item.</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs font-semibold text-stone-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Judul Kegiatan Event*</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Seminar & Workshop AI Developer Kampus"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 outline-hidden transition-all text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Kategori Kegiatan</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 font-semibold"
                  >
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Lomba">Lomba Operasional / Hackathon</option>
                    <option value="Olahraga">Cabang Olahraga</option>
                    <option value="Seni">Seni Musik / Musik</option>
                    <option value="Sosial">Kegiatan Sosial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Tanggal Pelaksanaan*</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Aula Utama Kampus B / Virtual Zoom"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Organisasi / HMJ / UKM Penyelenggara</label>
                  <input
                    type="text"
                    placeholder="Contoh: Himpunan Mahasiswa Arsitektur (HMA)"
                    value={formOrganization}
                    onChange={(e) => setFormOrganization(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Jam Pelaksanaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 09:00 - 15:30 WIB"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Tujuan Kegiatan (Utama)</label>
                <textarea
                  placeholder="Deskripsikan secara singkat tujuan strategis terlaksananya luaran event ini..."
                  rows={2}
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl p-3 text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Deskripsi Acara &amp; Promosi</label>
                <textarea
                  placeholder="Ketik rincian narasi acara marketing yang akan dipublikasikan ke kalender umum mahasiswa..."
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl p-3 text-xs text-stone-800"
                />
              </div>

              {/* Fake Document attachment */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-stone-450 mb-1 font-mono">Dokumen Proposal Pendukung (Opsional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik nama file rujukan e.g. Proposal_Futsal_HMA.pdf"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="flex-grow bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-stone-800"
                  />
                  <div className="px-4 py-2 border bg-stone-50 border-stone-200 hover:bg-stone-100 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold text-stone-605 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </div>
                </div>
              </div>

              {/* BUDGET SECTION IN FORM */}
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <h4 className="text-xs font-black text-stone-900 uppercase">Input Anggaran Belanja Kegiatan</h4>
                
                {/* Temp Add Budget fields */}
                <div className="p-4 border border-stone-150 rounded-xl bg-stone-50/50 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[9px] font-black text-stone-400 uppercase mb-1 font-mono">Nama Item Anggaran</label>
                    <input
                      type="text"
                      placeholder="Contoh: Cetak Photobooth & Backdrop"
                      value={bItemName}
                      onChange={(e) => setBItemName(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-805"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-stone-400 uppercase mb-1 font-mono">Kategori</label>
                    <select
                      value={bCategory}
                      onChange={(e) => setBCategory(e.target.value as any)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-805"
                    >
                      <option value="konsumsi">Konsumsi</option>
                      <option value="perlengkapan">Perlengkapan</option>
                      <option value="transportasi">Transportasi</option>
                      <option value="akomodasi">Akomodasi</option>
                      <option value="dokumentasi">Dokumentasi</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-stone-400 uppercase mb-1 font-mono">Qty</label>
                    <input
                      type="number"
                      value={bQty}
                      onChange={(e) => setBQty(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-805 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-stone-400 uppercase mb-1 font-mono">Harga Satuan (IDR)</label>
                    <input
                      type="number"
                      value={bUnitPrice}
                      onChange={(e) => setBUnitPrice(parseInt(e.target.value) || 0)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-805 font-mono"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-black text-stone-400 uppercase mb-1 font-mono">Catatan Rincian Belanja PO</label>
                    <input
                      type="text"
                      placeholder="Rincikan deskripsi belanja, merk, spec dsb..."
                      value={bNote}
                      onChange={(e) => setBNote(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-805"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addTempBudget}
                      className="w-full bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Keep Anggaran
                    </button>
                  </div>
                </div>

                {/* Temp budgets table list */}
                {tempBudgets.length > 0 && (
                  <div className="border border-stone-150 rounded-xl overflow-hidden bg-white">
                    <div className="p-3 bg-stone-50 border-b border-stone-150 flex justify-between items-center text-[10px] uppercase font-bold text-stone-550 tracking-wider">
                      <span>Draf Item Anggaran ({tempBudgets.length} Item)</span>
                      <span className="font-mono font-bold text-stone-850">
                        Sektor Total: Rp {tempBudgets.reduce((acc, b) => acc + b.qty * b.unitPrice, 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="divide-y divide-stone-100 max-h-[220px] overflow-y-auto">
                      {tempBudgets.map((b, idx) => (
                        <div key={idx} className="p-3 hover:bg-stone-50 flex justify-between items-center text-xs">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-100 font-mono text-stone-500 uppercase mr-1.5">{b.category}</span>
                            <span className="font-bold text-stone-800">{b.itemName}</span>
                            {b.poNote && <p className="text-[10px] text-stone-400 italic mt-0.5">Note: {b.poNote}</p>}
                          </div>
                          
                          <div className="flex items-center gap-4 text-right shrink-0">
                            <div className="font-mono">
                              <span className="text-stone-400 font-medium">{b.qty} x Rp {b.unitPrice.toLocaleString("id-ID")}</span>
                              <span className="font-bold text-stone-900 block">Rp {(b.qty * b.unitPrice).toLocaleString("id-ID")}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTempBudget(idx)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-stone-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => handleCreateEvent("Draft")}
                  className="px-4 py-3 border border-stone-250 hover:bg-stone-50 text-stone-701 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  Simpan Lokal (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateEvent("Submitted")}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  Submit ke Kemahasiswaan
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* DETAILED INSPECTION DYNAMIC DRAWEOVER / MODAL */}
      {selectedEvt && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-2xs flex justify-end z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto flex flex-col shadow-2xl relative border-l border-stone-200 animate-in slide-in-from-right duration-300" id="po_inspector_drawer">
            {/* Drawer Header */}
            <div className="p-4 bg-stone-900 text-stone-100 sticky top-0 flex items-center justify-between z-10">
              <div className="min-w-0">
                <span className="text-[8px] font-bold tracking-widest bg-stone-850 text-indigo-400 uppercase px-2 py-0.5 rounded border border-indigo-950 font-mono block">
                  Detail Pengajuan Event # {selectedEvt.id}
                </span>
                <h4 className="text-sm font-black text-white mt-1 leading-snug truncate">
                  {selectedEvt.title}
                </h4>
              </div>

              <button
                onClick={() => setSelectedEvt(null)}
                className="p-1 px-2.5 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inspect Panel Content Body */}
            <div className="p-5 flex-1 space-y-6 text-stone-700 text-xs">
              
              {/* Event Properties and status */}
              <div className="border border-stone-150 p-4 rounded-2xl bg-stone-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase text-stone-450 tracking-wider">Informasi Publik</span>
                  <span className={`text-[9px] px-2.1 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadgeClass(selectedEvt.status)}`}>
                    {selectedEvt.status}
                  </span>
                </div>

                {!inspectEditMode ? (
                  <div className="space-y-2 leading-relaxed">
                    <h5 className="font-bold text-stone-900 text-sm">{selectedEvt.title}</h5>
                    <p className="text-stone-500">{selectedEvt.description}</p>
                    <div className="text-[11px] bg-white border border-stone-100 p-2.5 rounded-xl space-y-1 text-stone-600 font-medium">
                      <div>🏢 <strong>HMJ Penyelenggara:</strong> {selectedEvt.organizer}</div>
                      <div>🗓️ <strong>Tanggal Pelaksanaan:</strong> {formatDate(selectedEvt.date)}</div>
                      <div>📍 <strong>Lokasi/Aula:</strong> {selectedEvt.location}</div>
                      <div>🎯 <strong>Tujuan Utama:</strong> {(selectedEvt as any).purpose || "-"}</div>
                    </div>

                    {/* Button trigger edit */}
                    {(selectedEvt.status === "Draft" || selectedEvt.status === "Revision Requested") && (
                      <button
                        onClick={() => setInspectEditMode(true)}
                        className="py-1.5 px-3 bg-white border border-stone-250 text-stone-700 font-bold rounded-lg text-[10px] hover:bg-stone-50 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Detil Proposal
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase block font-mono">Judul Event</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase block font-mono">Tujuan Kegiatan</label>
                      <textarea
                        value={editPurpose}
                        onChange={(e) => setEditPurpose(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase block font-mono">Deskripsi Promosi</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-1">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase block font-mono">Tanggal</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-xs text-stone-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase block font-mono">Lokasi</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-xs text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setInspectEditMode(false)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-605 rounded-lg text-[10px] font-bold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveDraftChanges}
                        className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-755 text-white rounded-lg text-[10px] font-bold"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviewer Note Block */}
              {(selectedEvt as any).reviewer_note && (
                <div className="p-3 border border-yellow-200 bg-yellow-50/50 text-stone-700 rounded-xl leading-relaxed">
                  <div className="text-[9px] text-yellow-800 font-extrabold font-mono uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Catatan feedback Kemahasiswaan:
                  </div>
                  <p className="text-[11px] mt-1 text-yellow-950 font-bold italic">
                    "{(selectedEvt as any).reviewer_note}"
                  </p>
                </div>
              )}

              {/* Budget Item Table inside Inspector */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-stone-450 tracking-wider">Rincian Anggaran Belanja Kegiatan</h4>
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                    Sektor Total: Rp {calculateSumBudget(selectedEvt.id).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Add budget item in Inspector if in Draft/Revision status */}
                {(selectedEvt.status === "Draft" || selectedEvt.status === "Revision Requested") && (
                  <div className="p-3 border border-stone-150 rounded-xl bg-stone-50/50 space-y-3">
                    <span className="text-[9px] font-extrabold uppercase text-stone-450 block font-mono">Tambah Anggaran Tambahan</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nama Item Anggaran..."
                        value={insBItemName}
                        onChange={(e) => setInsBItemName(e.target.value)}
                        className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800"
                      />
                      <select
                        value={insBCategory}
                        onChange={(e) => setInsBCategory(e.target.value as any)}
                        className="bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs text-stone-800"
                      >
                        <option value="konsumsi">Konsumsi</option>
                        <option value="perlengkapan">Perlengkapan</option>
                        <option value="transportasi">Transportasi</option>
                        <option value="akomodasi">Akomodasi</option>
                        <option value="dokumentasi">Dokumentasi</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={insBQty}
                        onChange={(e) => setInsBQty(parseInt(e.target.value) || 0)}
                        className="bg-white border border-stone-200 rounded-lg p-1.5 text-xs text-stone-800 font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Harga Satuan (IDR)"
                        value={insBUnitPrice}
                        onChange={(e) => setInsBUnitPrice(parseInt(e.target.value) || 0)}
                        className="bg-white border border-stone-200 rounded-lg p-1.5 text-xs text-stone-800 font-mono"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Catatan belanja PO..."
                        value={insBNote}
                        onChange={(e) => setInsBNote(e.target.value)}
                        className="flex-grow bg-white border border-stone-200 rounded-lg p-1.5 text-xs text-stone-800 font-semibold"
                      />
                      <button
                        onClick={handleAddBudgetInInspector}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer text-xs"
                      >
                        Keep Item
                      </button>
                    </div>
                  </div>
                )}

                {/* Display list of active budget items */}
                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-150 bg-white shadow-3xs">
                  {getEventBudgets(selectedEvt.id).length === 0 ? (
                    <p className="p-4 text-center italic text-stone-400">Belum ada item anggaran diajukan.</p>
                  ) : (
                    getEventBudgets(selectedEvt.id).map((b) => {
                      let budgetStatusBadge = "bg-stone-50 text-stone-505";
                      if (b.status === "Approved") budgetStatusBadge = "bg-emerald-50 text-emerald-700";
                      else if (b.status === "Rejected") budgetStatusBadge = "bg-rose-50 text-rose-700";
                      else if (b.status === "Partially Approved") budgetStatusBadge = "bg-amber-50 text-amber-700";

                      return (
                        <div key={b.id} className="p-3.5 hover:bg-stone-50/50 flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1 leading-snug">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 font-mono uppercase">{b.category}</span>
                              <span className="font-bold text-stone-900 text-xs">{b.itemName}</span>
                              <span className={`text-[8px] font-bold px-1.5 uppercase font-mono rounded ${budgetStatusBadge}`}>#{b.status}</span>
                            </div>
                            {b.poNote && <p className="text-[10px] text-stone-400 italic mt-1 font-semibold">Note PO: {b.poNote}</p>}
                            {b.reviewerNote && (
                              <p className="text-[10px] text-[#A15C00] font-bold bg-[#FFF9ED] border border-[#FFE7C4]/70 p-1 rounded-sm mt-1">
                                Reviewer: {b.reviewerNote}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0 font-mono flex items-center gap-2">
                            <div>
                              <span className="text-stone-400 text-[10px]">{b.qty} x Rp {b.unitPrice.toLocaleString("id-ID")}</span>
                              <strong className="block text-stone-900">Rp {b.totalPrice.toLocaleString("id-ID")}</strong>
                            </div>

                            {/* Option delete in draft / revision requested state */}
                            {(selectedEvt.status === "Draft" || selectedEvt.status === "Revision Requested") && (
                              <button
                                onClick={() => handleDeleteBudgetInInspector(b.id, b.itemName)}
                                className="text-stone-420 hover:text-rose-600 transition-colors duration-150 p-1 cursor-pointer ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* TIMELINE ACTIVITY LOG AUDIT TRAIL */}
              <div className="space-y-3 pb-4">
                <h4 className="text-xs font-black uppercase text-stone-450 tracking-wider">
                  Riwayat Aktivitas &amp; Audit Trail
                </h4>

                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3 relative overflow-hidden">
                  <div className="absolute left-6.5 top-5 bottom-5 w-[1.5px] bg-stone-200"></div>

                  {getEventLogs(selectedEvt.id).length === 0 ? (
                    <p className="text-center italic text-stone-400">Tidak ada audit logs.</p>
                  ) : (
                    getEventLogs(selectedEvt.id).map((log, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10 text-xs">
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-indigo-500 text-indigo-650 font-mono font-bold text-[9px] flex items-center justify-center shrink-0 shadow-3xs">
                          {idx + 1}
                        </div>
                        <div className="flex-grow space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-850 bg-white px-1 rounded border border-stone-100">{log.action}</span>
                            <span className="text-[9px] text-stone-400 font-mono">{new Date(log.createdAt).toLocaleString("id-ID")}</span>
                          </div>
                          <p className="text-stone-500 text-[11px] font-medium leading-relaxed">{log.description}</p>
                          <span className="text-[9px] font-semibold text-stone-400 font-mono">PJ: {log.userName}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Inspect bottom control bar */}
            <div className="p-4 bg-stone-50 sticky bottom-0 border-t border-stone-200 flex justify-between z-10 shrink-0">
              <button
                onClick={() => setSelectedEvt(null)}
                className="px-4 py-2 border border-stone-250 hover:bg-stone-100 text-stone-701 rounded-xl text-xs font-bold transition-all"
              >
                Tutup Review
              </button>

              {/* Trigger Submit / Resubmit if draft or revision requested */}
              {(selectedEvt.status === "Draft") && (
                <button
                  onClick={() => {
                    // Update to Submitted directly
                    const updated = events.map((e) => {
                      if (e.id === selectedEvt.id) {
                        return { ...e, status: "Submitted" as const, submitted_at: new Date().toISOString() };
                      }
                      return e;
                    });
                    saveEvents(updated);
                    addActivityLog(selectedEvt.id, user.email, user.name, "Event diajukan", "Event draft disubmit langsung oleh PO.");
                    addNotification("Persetujuan", `Review Event Baru: ${selectedEvt.title}`, `PO ${user.name} baru saja mengajukan event '${selectedEvt.title}'.`, ["staff"]);
                    addToast(`Sukses menyubmit proposal event '${selectedEvt.title}' ke Staf Kemahasiswaan!`, "success");
                    setSelectedEvt(null);
                    refreshData();
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Pengajuan Event
                </button>
              )}

              {(selectedEvt.status === "Revision Requested") && (
                <button
                  onClick={handleResubmitEvent}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim Ulang Proposal
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </Workspace>
  );
}
