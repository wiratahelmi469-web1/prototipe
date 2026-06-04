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
  Landmark, 
  Users, 
  CalendarCheck, 
  Award, 
  TrendingUp, 
  Hourglass, 
  CheckCircle2, 
  XSquare, 
  FileSearch, 
  HelpCircle, 
  ArrowRight, 
  X, 
  Check, 
  AlertTriangle, 
  Send, 
  Info,
  DollarSign
} from "lucide-react";
import { formatDate } from "../../../lib/utils";
import Toast, { ToastContainer } from "../../../components/Toast";

export default function StaffApprovalDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Core syncing states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"monitor" | "queue" | "budget" | "history">("monitor");

  // Selected event for detailed review dialog/drawer
  const [inspectEvt, setInspectEvt] = useState<EventItem | null>(null);

  // Decision state fields
  const [decisionNote, setDecisionNote] = useState("");
  const [isNoteRequired, setIsNoteRequired] = useState(false);
  const [decisionType, setDecisionType] = useState<"approve" | "reject" | "revision" | null>(null);

  // Individual item review editing states
  const [itemReviewId, setItemReviewId] = useState<string | null>(null);
  const [itemReviewNote, setItemReviewNote] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "staff") {
      router.push("/login");
      return;
    }

    refreshData();
  }, [user, loading, router]);

  const refreshData = () => {
    setEvents(getEvents());
    setBudgetItems(getBudgetItems());
    setActivityLogs(getActivityLogs());
  };

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Status utility helpers
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-stone-150 text-stone-700 border border-stone-300";
      case "Submitted":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Under Review":
        return "bg-amber-50 text-amber-700 border border-amber-250";
      case "Revision Requested":
        return "bg-yellow-50 text-yellow-800 border border-yellow-250";
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-250";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border border-rose-250";
      default:
        return "bg-stone-100 text-stone-600";
    }
  };

  const calculateSumBudget = (evtId: string) => {
    return budgetItems.filter((b) => b.eventId === evtId).reduce((acc, b) => acc + b.totalPrice, 0);
  };

  const calculateApprovedBudget = (evtId: string) => {
    return budgetItems
      .filter((b) => b.eventId === evtId && b.status === "Approved")
      .reduce((acc, b) => acc + b.totalPrice, 0);
  };

  // Inline Item-by-item Budget Actions
  const handleReviewBudgetItem = (id: string, status: "Approved" | "Rejected" | "Partially Approved", reviewerNote: string) => {
    const bgts = getBudgetItems();
    const updated = bgts.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          status,
          reviewerNote: reviewerNote || (status === "Approved" ? "Sesuai rujukan." : "Ditolak / Perbaiki rincian.")
        };
      }
      return b;
    });

    saveBudgetItems(updated);
    
    // Add activity log
    const targetItem = bgts.find(b => b.id === id);
    if (targetItem && inspectEvt) {
      addActivityLog(
        inspectEvt.id, 
        user?.email || "staff@nurulfikri.ac.id", 
        "Staf Kemahasiswaan", 
        "Audit anggaran", 
        `Item anggaran '${targetItem.itemName}' ditandai ${status === "Approved" ? "Disetujui" : "Ditolak"} — ${reviewerNote || "-"}`
      );
    }
    
    refreshData();
    setItemReviewId(null);
    setItemReviewNote("");
    addToast("Status rincian anggaran berhasil diperbarui!", "success");
  };

  // Set the global event level status decision
  const handleFinalizeDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectEvt || !decisionType) return;

    if ((decisionType === "reject" || decisionType === "revision") && !decisionNote.trim()) {
      addToast(`Wajib mengisi alasan/catatan untuk tindakan ${decisionType === "reject" ? "Ditolak" : "Minta Revisi"}`, "error");
      return;
    }

    let finalStatus: "Approved" | "Rejected" | "Revision Requested" = "Approved";
    let actionLogTitle = "Event disetujui";
    let notifCategory: "Persetujuan" | "Penting" | "Tugas" = "Persetujuan";
    let notifTitle = "";
    let notifDesc = "";

    // Calculate budget state overall
    const eventBudgets = budgetItems.filter(b => b.eventId === inspectEvt.id);
    const approvedCount = eventBudgets.filter(b => b.status === "Approved").length;
    const partialCount = eventBudgets.filter(b => b.status === "Partially Approved").length;
    const rejectedCount = eventBudgets.filter(b => b.status === "Rejected").length;

    let isPartiallyApproved = false;
    if (decisionType === "approve") {
      finalStatus = "Approved";
      actionLogTitle = "Event disetujui";
      
      if (rejectedCount > 0 || partialCount > 0) {
        isPartiallyApproved = true;
      }
      
      notifTitle = isPartiallyApproved ? `Anggaran Event Disetujui Sebagian` : `Proposal Event Disetujui!`;
      notifDesc = isPartiallyApproved 
        ? `Event '${inspectEvt.title}' disetujui, namun beberapa item anggaran ditolak/disesuaikan. Sila cek rincian.`
        : `Selamat! Event '${inspectEvt.title}' disetujui sepenuhnya oleh Kemahasiswaan. Pendaftaran sekarang aktif.`;
    } else if (decisionType === "reject") {
      finalStatus = "Rejected";
      actionLogTitle = "Event ditolak";
      notifTitle = `Pengajuan Event Ditolak`;
      notifDesc = `Mohon maaf, pengajuan event '${inspectEvt.title}' ditolak oleh Kemahasiswaan dengan alasan: ${decisionNote}`;
    } else {
      finalStatus = "Revision Requested";
      actionLogTitle = "Revisi diminta";
      notifTitle = `Revisi Diminta untuk Event Anda`;
      notifDesc = `Staf Kemahasiswaan meminta perubahan pada event '${inspectEvt.title}': ${decisionNote}`;
    }

    // Update event list
    const updatedEvents = events.map((evt) => {
      if (evt.id === inspectEvt.id) {
        return {
          ...evt,
          status: finalStatus,
          approved_at: finalStatus === "Approved" ? new Date().toISOString() : undefined,
          reviewer_id: user?.email || "staff@nurulfikri.ac.id",
          reviewer_note: decisionNote || "Persetujuan formal."
        } as any;
      }
      return evt;
    });

    saveEvents(updatedEvents);

    // Write Log
    addActivityLog(
      inspectEvt.id, 
      user?.email || "staff@nurulfikri.ac.id", 
      "Staf Kemahasiswaan", 
      actionLogTitle, 
      `${actionLogTitle} oleh Staf Kemahasiswaan. Catatan: ${decisionNote || "Tanpa kendala"}`
    );

    // Push notification to PO
    addNotification(
      "Persetujuan",
      notifTitle,
      notifDesc,
      ["po"]
    );

    addToast(`Keputusan '${finalStatus}' berhasil disimpan untuk event '${inspectEvt.title}'!`, "success");
    setInspectEvt(null);
    setDecisionNote("");
    setDecisionType(null);
    refreshData();
  };

  const startReviewingEvent = (evt: EventItem) => {
    // Automatically transition Draft/Submitted to Under Review upon opening first time
    if (evt.status === "Submitted") {
      const updated = events.map((e) => {
        if (e.id === evt.id) {
          return { ...e, status: "Under Review" as const };
        }
        return e;
      });
      saveEvents(updated);
      addActivityLog(evt.id, user?.email || "staff@nurulfikri.ac.id", "Staf Kemahasiswaan", "Event ditinjau", "Status pengajuan diperbarui menjadi 'Under Review' oleh Staf.");
      refreshData();
      const loaded = updated.find(e => e.id === evt.id);
      if (loaded) setInspectEvt(loaded);
    } else {
      setInspectEvt(evt);
    }
    
    setDecisionNote("");
    setDecisionType(null);
  };

  const getEventBudgets = (evtId: string) => {
    return budgetItems.filter((b) => b.eventId === evtId);
  };

  const getEventLogs = (evtId: string) => {
    return activityLogs.filter((l) => l.eventId === evtId);
  };

  if (loading || !user) return null;

  // Aggregate stats calculate
  const totalSubmittedBudget = budgetItems.reduce((acc, b) => acc + b.totalPrice, 0);
  const totalApprovedBudget = budgetItems.filter(b => b.status === "Approved").reduce((acc, b) => acc + b.totalPrice, 0);

  const totalProposals = events.length;
  const waitingReview = events.filter((e) => e.status === "Submitted" || e.status === "Under Review").length;
  const approvedThisMonth = events.filter((e) => e.status === "Approved").length;
  const rejectedThisMonth = events.filter((e) => e.status === "Rejected").length;

  // Queues
  const reviewQueueList = events.filter((e) => e.status === "Submitted" || e.status === "Under Review" || e.status === "Revision Requested");
  const historyList = events.filter((e) => e.status === "Approved" || e.status === "Rejected");

  return (
    <Workspace id="staff_dashboard_viewport">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="space-y-6" id="staff_substructure">
        {/* Staff Header Panel */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center gap-4.5 justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-extrabold text-base uppercase shrink-0">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-stone-400 font-extrabold uppercase tracking-widest font-mono">PORTAL SISTEM KEMAHASISWAAN</p>
              <h2 className="text-base font-black text-stone-900 mt-0.5 truncate">Halo, Staf Penguji Kemahasiswaan!</h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed truncate">
                Tinjau draf proposal organisasi (PO), lakukan audit anggaran per item, and kendalikan kalender kemajuan kampus.
              </p>
            </div>
          </div>

          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "monitor" ? "bg-stone-900 text-white font-black" : "bg-stone-100 hover:bg-stone-200 text-stone-700"}`}
            >
              Monitor
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "queue" ? "bg-stone-900 text-white font-black" : "bg-stone-100 hover:bg-stone-200 text-stone-700"}`}
            >
              Antrean Review ({reviewQueueList.length})
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "budget" ? "bg-stone-900 text-white font-black" : "bg-stone-100 hover:bg-stone-200 text-stone-700"}`}
            >
              Audit Item Belanja
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === "history" ? "bg-stone-900 text-white font-black" : "bg-stone-100 hover:bg-stone-200 text-stone-700"}`}
            >
              Arsip Sejarah
            </button>
          </div>
        </div>

        {/* MONITORING VIEW WITH BIG CARDS */}
        {activeTab === "monitor" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Aggregate Board Dashboard widget */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="staff_global_counters">
              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider block">Total Pengajuan</span>
                  <span className="text-xl font-black text-stone-850 font-mono mt-1 block">{totalProposals} Event</span>
                  <p className="text-[9px] text-stone-400 mt-1">Kegiatan keseluruhan didata</p>
                </div>
                <Users className="w-8 h-8 text-stone-300 hidden sm:block" />
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider block">Menunggu Review</span>
                  <span className="text-xl font-black text-amber-600 font-mono mt-1 block">{waitingReview} Event</span>
                  <p className="text-[9px] text-[#A15C00] font-semibold mt-1">Sektor krusial antrean</p>
                </div>
                <Hourglass className="w-8 h-8 text-amber-300 hidden sm:block" />
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider block">Disetujui Resmi</span>
                  <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">{approvedThisMonth} Event</span>
                  <p className="text-[9px] text-emerald-600 font-semibold mt-1">Siap pendaftaran / tayang</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-300 hidden sm:block" />
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs flex items-center justify-between border-l-4 border-l-indigo-600">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider block">Anggaran Disetujui</span>
                  <span className="text-lg font-black text-indigo-750 font-mono mt-1 block">Rp {totalApprovedBudget.toLocaleString("id-ID")}</span>
                  <span className="text-[9px] text-stone-400 mt-1 block">Dari Rp {totalSubmittedBudget.toLocaleString("id-ID")} diajukan</span>
                </div>
                <DollarSign className="w-8 h-8 text-indigo-350 hidden sm:block" />
              </div>
            </div>

            {/* Event Approval Queue Preview widget layout */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-stone-450 tracking-wider">ANTREAN REVIEW TERBARU</h3>
                <button
                  onClick={() => setActiveTab("queue")}
                  className="text-xs font-bold text-indigo-650 hover:text-indigo-800 flex items-center gap-1.5"
                >
                  Buka Seluruh Antrean <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {reviewQueueList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-stone-100 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-stone-400 italic">Semua pengajuan bersih! Tidak ada antrean pending.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                  {reviewQueueList.slice(0, 3).map((evt) => (
                    <div key={evt.id} className="p-4 bg-white hover:bg-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors" id={`staff_queue_row_${evt.id}`}>
                      <div>
                        <div className="flex items-center gap-2 text-[9px] font-extrabold font-mono">
                          <span className="text-indigo-705 uppercase">{evt.category}</span>
                          <span className="text-stone-300">•</span>
                          <span className={`${getStatusBadgeClass(evt.status)} px-1.5 py-0.1 uppercase rounded-xs font-mono`}>{evt.status}</span>
                        </div>
                        <h5 className="text-xs font-bold text-stone-900 mt-1 leading-snug">{evt.title}</h5>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">PO: {evt.coordinator} • Penyelenggara: {evt.organizer}</p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                        <div className="text-left md:text-right font-mono">
                          <span className="text-xs font-black text-stone-850 block">Rp {calculateSumBudget(evt.id).toLocaleString("id-ID")}</span>
                          <span className="text-[9px] text-stone-400 block block">Tgl Pengajuan: {evt.date}</span>
                        </div>
                        <button
                          onClick={() => startReviewingEvent(evt)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Review Proposal
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* COMPREHENSIVE APPROVAL QUEUE TABLE */}
        {activeTab === "queue" && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200" id="staff_queue_table_container">
            <h3 className="text-xs font-bold uppercase text-stone-450 tracking-wider">EVENT APPROVAL QUEUE</h3>
            
            {reviewQueueList.length === 0 ? (
              <p className="py-12 text-center text-stone-400 italic">Antrean kosong.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-stone-150 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50">
                      <th className="py-3 px-3">Nama Event</th>
                      <th className="py-3 px-3">Organisasi / HMJ</th>
                      <th className="py-3 px-3">PO Pengusul</th>
                      <th className="py-3 px-3">Tanggal Pengajuan</th>
                      <th className="py-3 px-3">Total Anggaran</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                    {reviewQueueList.map((e) => (
                      <tr key={e.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-stone-900">{e.title}</td>
                        <td className="py-3 px-3 uppercase text-[10px] font-mono text-stone-500 font-extrabold">{e.organizer}</td>
                        <td className="py-3 px-3 font-semibold text-stone-600">{e.coordinator}</td>
                        <td className="py-3 px-3 font-mono text-[10.5px]">{e.date}</td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-850">Rp {calculateSumBudget(e.id).toLocaleString("id-ID")}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadgeClass(e.status)}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => startReviewingEvent(e)}
                            className="bg-stone-900 text-white hover:bg-stone-800 rounded-lg py-1 px-2.5 font-bold text-[10px] transition-all cursor-pointer"
                          >
                            Review Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BUDGET REVIEW QUEUE (AUDIT TAB) */}
        {activeTab === "budget" && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase text-stone-450 tracking-wider">BUDGET REVIEW QUEUE</h3>
            <p className="text-xs text-stone-400 mt-0.5">Tinjau silsilah proposal aktif, rincian biaya belanja belaka, and audit item dengan bijaksana.</p>

            <div className="space-y-6">
              {reviewQueueList.map((evt) => {
                const evBgt = getEventBudgets(evt.id);
                return (
                  <div key={evt.id} className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50/20" id={`budget_audit_${evt.id}`}>
                    <div className="p-3 bg-stone-550 bg-stone-50 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      <div>
                        <span className="text-[8px] bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded font-mono font-black uppercase">{evt.category} # {evt.id}</span>
                        <h4 className="text-xs font-black text-stone-900 mt-1">{evt.title}</h4>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startReviewingEvent(evt)}
                          className="px-2.5 py-1.5 border border-stone-200 hover:bg-stone-100 bg-white text-stone-700 font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          Review Seluruh Proposal
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-stone-105 bg-white text-xs">
                      {evBgt.length === 0 ? (
                        <p className="p-4 text-center italic text-stone-400">Belum ada rincian anggaran yang diajukan PO.</p>
                      ) : (
                        evBgt.map((b) => (
                          <div key={b.id} className="p-3 hover:bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="min-w-0 flex-1 leading-snug">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-stone-100 text-stone-400 font-mono text-[8px] px-1 rounded uppercase font-black">{b.category}</span>
                                <strong className="text-stone-850">{b.itemName}</strong>
                                <span className={`text-[8px] tracking-wide font-mono uppercase font-black px-1.5 rounded ${b.status === "Approved" ? "bg-emerald-50 text-emerald-600" : b.status === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                                  {b.status}
                                </span>
                              </div>
                              {b.poNote && <p className="text-[10px] text-stone-400 italic mt-0.5">PO: {b.poNote}</p>}
                              {b.reviewerNote && <p className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 p-0.5 px-1.5 rounded-sm inline-block mt-0.5">Catatan Staf: {b.reviewerNote}</p>}
                            </div>

                            <div className="flex items-center gap-4 text-right shrink-0">
                              <div className="font-mono">
                                <span className="text-[10px] text-stone-400">{b.qty} x Rp {b.unitPrice.toLocaleString("id-ID")}</span>
                                <span className="font-extrabold text-stone-900 block">Rp {b.totalPrice.toLocaleString("id-ID")}</span>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleReviewBudgetItem(b.id, "Approved", "Sesuai standard.")}
                                  className="p-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 cursor-pointer text-[10px]"
                                >
                                  ✔ Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setItemReviewId(b.id);
                                    setItemReviewNote("");
                                  }}
                                  className="p-1 px-2.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-lg hover:bg-rose-100 cursor-pointer text-[10px]"
                                >
                                  ✘ Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORICAL WORKFLOW ARCHIVES */}
        {activeTab === "history" && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase text-stone-450 tracking-wider">ARSIP TERSEGEL KEPUTUSAN</h3>
            
            {historyList.length === 0 ? (
              <p className="py-8 text-center text-stone-400 italic">Belum ada arsip terdokumentasi.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-stone-150 text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-50">
                      <th className="py-3 px-3">Nama Event</th>
                      <th className="py-3 px-3">Organisasi</th>
                      <th className="py-3 px-3">Pengusul PO</th>
                      <th className="py-3 px-3">Status Keputusan</th>
                      <th className="py-3 px-3">Anggaran Disetujui</th>
                      <th className="py-3 px-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                    {historyList.map((e) => (
                      <tr key={e.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-stone-900">{e.title}</td>
                        <td className="py-3 px-3 uppercase text-[10px] font-mono text-stone-400 font-extrabold">{e.organizer}</td>
                        <td className="py-3 px-3 font-semibold text-stone-500">{e.coordinator}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[8.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadgeClass(e.status)}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-stone-850">
                          Rp {calculateApprovedBudget(e.id).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => startReviewingEvent(e)}
                            className="bg-stone-100 hover:bg-stone-200 rounded-lg p-1 px-2 font-bold text-[9.5px]"
                          >
                            Lihat Log Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INDIVIDUAL ITEM BUDGET REVIEW NOTE TRIGGER (MODAL PROMPT) */}
      {itemReviewId && (
        <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-xl">
            <div>
              <h4 className="text-sm font-black text-stone-900 uppercase">Mengapa item anggaran ditolak?</h4>
              <p className="text-xs text-stone-400 mt-0.5">Berikan ulasan/catatan penasihat agar PO mengetahui alasan koreksian belanja ini.</p>
            </div>
            
            <textarea
              required
              rows={2}
              placeholder="Contoh: Terlalu mahal, silakan gunakan standard konsumsi Bu Susi @ Rp 15rb."
              value={itemReviewNote}
              onChange={(e) => setItemReviewNote(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-xs text-stone-800"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setItemReviewId(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-stone-500"
              >
                Batal
              </button>
              <button
                onClick={() => handleReviewBudgetItem(itemReviewId, "Rejected", itemReviewNote)}
                className="px-4 py-1.5 bg-rose-650 hover:bg-rose-755 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Tolak Item Belanja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPER DETAILED EVENT APPROVAL SLIDEOVER PANEL (DIALOG) */}
      {inspectEvt && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-2xs flex justify-end z-45 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto flex flex-col shadow-2xl relative border-l border-stone-200 animate-in slide-in-from-right duration-300" id="staff_inspect_drawer">
            {/* Header */}
            <div className="p-4 bg-stone-900 text-stone-100 sticky top-0 flex items-center justify-between z-10">
              <div className="min-w-0">
                <span className="text-[8.5px] font-bold bg-indigo-900 text-indigo-100 px-2.5 py-0.5 rounded border border-indigo-950 font-mono uppercase block">
                  Panel Evaluasi Approval Kemahasiswaan
                </span>
                <h4 className="text-sm font-black text-white mt-1 leading-snug truncate">
                  {inspectEvt.title}
                </h4>
              </div>

              <button
                onClick={() => setInspectEvt(null)}
                className="p-1 px-2.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* inspect panel body */}
            <div className="p-5 flex-1 space-y-6 text-stone-700 text-xs">
              
              {/* Event Properties and status */}
              <div className="border border-stone-200 p-4 rounded-xl bg-stone-50/50 space-y-3">
                <div className="flex justify-between items-center bg-stone-100/50 p-1.5 px-2.5 rounded-lg">
                  <span className="font-bold text-[10px] text-stone-550 uppercase tracking-widest font-mono">Status Aktif Pengisian:</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusBadgeClass(inspectEvt.status)}`}>
                    {inspectEvt.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-stone-400 font-mono">ORGANISASI HMJ/UKM:</span>
                  <h4 className="font-extrabold text-stone-850 text-sm">{inspectEvt.organizer}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-stone-600 font-medium">
                  <div>🗓️ <strong>Hari/Tanggal:</strong> {formatDate(inspectEvt.date)}</div>
                  <div>📍 <strong>Lokasi/Aula:</strong> {inspectEvt.location}</div>
                  <div>🕒 <strong>Jam/Waktu:</strong> {inspectEvt.time}</div>
                  <div>👤 <strong>PJ / Koordinator PO:</strong> {inspectEvt.coordinator}</div>
                </div>

                <div className="pt-2 border-t border-stone-150 space-y-2">
                  <div>
                    <span className="text-[9px] font-black text-stone-400 block font-mono">Tujuan Dan Sasaran Pokok:</span>
                    <p className="leading-relaxed font-semibold text-stone-750">
                      {(inspectEvt as any).purpose || "Mendongkrak daya intelektual and integrasi keilmuan civitas akademika."}
                    </p>
                  </div>

                  <div className="pt-1.5">
                    <span className="text-[9px] font-black text-stone-400 block font-mono">Uraian / Deskripsi Pengajuan Proposal:</span>
                    <p className="leading-relaxed text-stone-500">
                      {inspectEvt.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* BUDGET WORKBREAKDOWN ITEM-BY-ITEM SECTION WITH INTERACTIVE BUTTONS */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-stone-450 tracking-wider">Breakdown Audit Rincian Belanja ({getEventBudgets(inspectEvt.id).length} Item)</h4>
                  <span className="font-mono font-bold text-stone-850 bg-stone-100 px-2 py-0.5 rounded">
                    Total Sektor: Rp {calculateSumBudget(inspectEvt.id).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-150 bg-white shadow-3xs">
                  {getEventBudgets(inspectEvt.id).length === 0 ? (
                    <p className="p-4 text-center italic text-stone-400">Belum ada item anggaran diinput oleh PO.</p>
                  ) : (
                    getEventBudgets(inspectEvt.id).map((b) => {
                      let budgetStatusBadge = "bg-stone-50 text-stone-500";
                      if (b.status === "Approved") budgetStatusBadge = "bg-emerald-50 text-emerald-800";
                      else if (b.status === "Rejected") budgetStatusBadge = "bg-rose-50 text-rose-800";

                      return (
                        <div key={b.id} className="p-3.5 hover:bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="min-w-0 flex-1 leading-snug">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[8.5px] font-black px-1.5 py-0.1 bg-stone-100 rounded text-stone-405 font-mono uppercase mr-1">{b.category}</span>
                              <strong className="text-stone-850">{b.itemName}</strong>
                              <span className={`text-[8px] font-bold px-1.5 uppercase font-mono rounded ${budgetStatusBadge}`}>#{b.status}</span>
                            </div>
                            {b.poNote && <p className="text-[10px] text-stone-400 font-semibold italic mt-0.5">Catatan PO: {b.poNote}</p>}
                            {b.reviewerNote && (
                              <p className="text-[10.5px] text-indigo-705 bg-indigo-50 border border-indigo-100 p-0.5 px-2 rounded-xs mt-1.5">
                                Catatan Penguji: {b.reviewerNote}
                              </p>
                            )}
                          </div>

                          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0">
                            <div className="font-mono text-right shrink-0">
                              <span className="text-[10px] text-stone-400 block">{b.qty} x Rp {b.unitPrice.toLocaleString("id-ID")}</span>
                              <span className="font-extrabold text-stone-900">Rp {b.totalPrice.toLocaleString("id-ID")}</span>
                            </div>

                            {/* Audit decision tools */}
                            {inspectEvt.status !== "Approved" && inspectEvt.status !== "Rejected" && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleReviewBudgetItem(b.id, "Approved", "Kebutuhan prioritas disetujui.")}
                                  className="text-[9px] font-bold py-1 px-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setItemReviewId(b.id);
                                    setItemReviewNote("");
                                  }}
                                  className="text-[9px] font-bold py-1 px-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded cursor-pointer transition-colors"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AUDIT TRAIL TIMELINE VIEW */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-stone-450 tracking-wider">
                  Silsilah Kronologis &amp; Log Aktivitas
                </h4>

                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3 relative overflow-hidden">
                  <div className="absolute left-6.5 top-5 bottom-5 w-[1.5px] bg-stone-250"></div>

                  {getEventLogs(inspectEvt.id).length === 0 ? (
                    <p className="text-center italic text-stone-400">Tidak ada audit logs.</p>
                  ) : (
                    getEventLogs(inspectEvt.id).map((log, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10 text-xs">
                        <div className="w-5 h-5 rounded-full bg-white border-2 border-indigo-650 text-indigo-700 font-mono font-bold text-[9px] flex items-center justify-center shrink-0 shadow-3xs">
                          {idx + 1}
                        </div>
                        <div className="flex-grow space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-stone-850">{log.action}</span>
                            <span className="text-[9px] text-stone-400 font-mono">{new Date(log.createdAt).toLocaleString("id-ID")}</span>
                          </div>
                          <p className="text-stone-500 text-[11px] leading-relaxed font-semibold">{log.description}</p>
                          <span className="text-[9px] font-semibold text-stone-400 font-mono">Uploader: {log.userName}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* FINAL AUDIT DECISION MODULE FORM SECTION */}
              {inspectEvt.status !== "Approved" && inspectEvt.status !== "Rejected" && (
                <form onSubmit={handleFinalizeDecision} className="p-4 border border-indigo-150 bg-indigo-50/20 rounded-xl space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-indigo-750 font-black uppercase text-[10px] tracking-wider block font-mono">Tentukan Keputusan Final Evaluasi:</span>
                    <p className="text-[11px] text-stone-450">Pilih salah satu status di bawah demi mengirim rilis keputusan kelayakan ke PO pengaju.</p>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType("approve");
                        setIsNoteRequired(false);
                      }}
                      className={`flex-1 py-3 text-center border-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                        decisionType === "approve"
                          ? "bg-emerald-600 border-emerald-700 text-white shadow-xs"
                          : "bg-white border-stone-200 text-stone-605 text-stone-600 tooltip hover:bg-stone-50"
                      }`}
                    >
                      Approve Event (Lolos)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType("revision");
                        setIsNoteRequired(true);
                      }}
                      className={`flex-1 py-3 text-center border-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                        decisionType === "revision"
                          ? "bg-amber-500 border-amber-600 text-white shadow-xs"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      Minta Revisi PO
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDecisionType("reject");
                        setIsNoteRequired(true);
                      }}
                      className={`flex-1 py-3 text-center border-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                        decisionType === "reject"
                          ? "bg-rose-600 border-rose-700 text-white shadow-xs"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      Reject Event (Tolak)
                    </button>
                  </div>

                  {decisionType && (
                    <div className="space-y-2.5 pt-1 bg-white p-3.5 border border-indigo-100 rounded-lg animate-in slide-in-from-top-2 duration-150">
                      <label className="block text-[9.5px] font-extrabold uppercase text-stone-450 font-mono">
                        Catatan reviewer kemahasiswaan {isNoteRequired && <span className="text-rose-500 font-extrabold">* (Wajib diisi)</span>}
                      </label>
                      <textarea
                        required={isNoteRequired}
                        rows={2}
                        placeholder={
                          decisionType === "approve"
                            ? "Berikan persetujuan penilai resmi..."
                            : decisionType === "reject"
                            ? "Wajib tulis alasan mengapa ditolak..."
                            : "Uraikan bagian item proposal / rincian dana yang wajib PO ubah..."
                        }
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800"
                      />

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-755 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" />
                          Publish Keputusan Review
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

            </div>

            {/* Bottom bar */}
            <div className="p-4 bg-stone-50 sticky bottom-0 border-t border-stone-200 flex justify-between z-10 shrink-0">
              <button
                onClick={() => setInspectEvt(null)}
                className="px-4 py-2 border border-stone-250 hover:bg-stone-100 text-stone-701 rounded-xl text-xs font-bold transition-all"
              >
                Kembali ke Antrean
              </button>
            </div>

          </div>
        </div>
      )}

    </Workspace>
  );
}
