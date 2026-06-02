"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { parseAndValidateQR } from "../../../../lib/scanUtils";
import { ScanLine, Sparkles, RefreshCw, AlertCircle, PlayCircle, ShieldAlert, Monitor, UserCheck } from "lucide-react";
import ScanResult from "../../../../components/ScanResult";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function QRScannerPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("evt-01");
  const [scannerLive, setScannerLive] = useState(false);

  // Scanner parsed outputs
  const [currentResult, setCurrentResult] = useState<any | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Demo simulate variables
  const demoTickets = [
    { name: "Ahmad Junaidi (Mhs)", email: "mahasiswa@nurulfikri.ac.id", eventId: "evt-01", label: "Ahmad Junaidi - Seminar Generative AI" },
    { name: "Siti Rahma", email: "panitia@nurulfikri.ac.id", eventId: "evt-01", label: "Siti Rahma - Seminar Generative AI" },
    { name: "Fadhil Muhammad", email: "fadhil_mhs@nurulfikri.ac.id", eventId: "evt-02", label: "Fadhil - Workshop UI/UX" }
  ];

  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "panitia") {
      router.push("/login");
      return;
    }

    // Sync / Load events
    const savedEvents = localStorage.getItem("eventhub_events");
    if (savedEvents) {
      try { setEvents(JSON.parse(savedEvents)); } catch(e) { setEvents(INITIAL_EVENTS); }
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

  // Webcam Scanner Activator
  const handleToggleWebcam = () => {
    // Inside sandboxed iframe environments, browser often blocks iframe gUM (getUserMedia).
    // Let's advise them that simulator fallback exists.
    setScannerLive(!scannerLive);
    if (!scannerLive) {
      addToast("Menggugah driver kamera... Cek izin peramban Anda / gunakan Mode Simulator di bawah.", "info");
    }
  };

  // Trigger simulated scan checking
  const handleSimulateScan = () => {
    const activeDemo = demoTickets[selectedDemoIndex];
    if (!activeDemo) return;

    // Build standard QR Payload: EH-TICKET: { ... }
    const payloadObject = {
      id: `tk-${Math.random().toString(36).substr(2, 9)}`,
      eventId: activeDemo.eventId,
      eventTitle: events.find(e => e.id === activeDemo.eventId)?.title || "Seminar Generative AI",
      email: activeDemo.email,
      name: activeDemo.name
    };

    const payloadText = `EH-TICKET:${JSON.stringify(payloadObject)}`;
    const parsed = parseAndValidateQR(payloadText, selectedEventId);

    setCurrentResult(parsed);

    if (parsed.isValid) {
      addToast("Simulator: Kehadiran siswa sukses dicatat!", "success");

      // Log scanned presence in local storage to sync certificates!
      const presenceKey = `presence_${selectedEventId}_students`;
      const savedPresences = localStorage.getItem(presenceKey);
      let presList: string[] = [];
      if (savedPresences) {
        try { presList = JSON.parse(savedPresences); } catch (e) {}
      }
      if (!presList.includes(activeDemo.email)) {
        localStorage.setItem(presenceKey, JSON.stringify([...presList, activeDemo.email]));
      }
    } else {
      addToast(`Simulator: ${parsed.message}`, "error");
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0];

  return (
    <Workspace id="panitia_scan_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6" id="scan_viewport">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-indigo-600 animate-pulse" />
            Scanner Tiket Kehadiran
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pindai barcode/QR Code pada e-ticket mahasiswa untuk mencatat kehadiran serta memvalidasi sertifikat mereka.
          </p>
        </div>

        {/* Layout content splitting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls columns */}
          <div className="space-y-6 col-span-1">
            {/* Event Target Selector */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <label htmlFor="evt_scan_picker" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2">EVENT LOKET SCAN AKTIF</label>
              <select
                id="evt_scan_picker"
                className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 font-semibold text-stone-800 focus:border-indigo-500 outline-hidden"
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setCurrentResult(null);
                }}
              >
                {events.filter(e => e.status !== "Pending Approval").map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>

              <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] leading-relaxed text-indigo-950 font-medium">
                Sektor Absensi terikat hanya untuk event terpilih. Scanner akan me-reject tiket dari event lain.
              </div>
            </div>

            {/* Quick Testing Simulator fallbacks */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3.5">
              <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-501" /> COZY TESTING SIMULATOR
              </h4>

              <div className="space-y-1.5">
                <label htmlFor="demo_ticket_select" className="text-[11px] text-stone-500 font-semibold">Daftar Tiket Simulasi</label>
                <select
                  id="demo_ticket_select"
                  className="w-full text-xs bg-stone-50 border border-stone-250 rounded-xl p-2.5 outline-hidden cursor-pointer"
                  value={selectedDemoIndex}
                  onChange={(e) => setSelectedDemoIndex(Number(e.target.value))}
                >
                  {demoTickets.map((tc, idx) => (
                    <option key={tc.email + idx} value={idx}>{tc.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSimulateScan}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                id="simulate_scan_btn"
              >
                <PlayCircle className="w-4 h-4 shrink-0" />
                Simulasikan Ketukan Absen
              </button>
            </div>
          </div>

          {/* Core Interactive Scanner screen */}
          <div className="col-span-1 md:col-span-2">
            {currentResult ? (
              <div className="animate-in zoom-in-95 duration-150">
                <ScanResult result={currentResult} onReset={() => setCurrentResult(null)} />
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[350px] text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-stone-50 border border-stone-220 flex items-center justify-center text-stone-400">
                  <ScanLine className="w-10 h-10 animate-pulse text-indigo-500" />
                </div>
                
                <h4 className="text-sm font-bold text-stone-850">Luncurkan Pindai Web Kamera</h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  Aktifkan kamera gawai / handphone Anda untuk membaca QR tiket secara langsung di pintu gerbang.
                </p>

                {scannerLive ? (
                  <div className="w-full max-w-sm rounded-xl overflow-hidden border border-rose-250 bg-stone-900 aspect-video flex flex-col items-center justify-center text-stone-400 p-4">
                    <p className="text-xs text-white uppercase font-bold animate-pulse">KAMERA MENUNGGU PERIZINAN IFRAME</p>
                    <p className="text-[10px] text-stone-400 mt-2 max-w-xs leading-relaxed">
                      Iframe sandboxed AI Studio memitigasi izin kamera. Silakan hubungkan uji simulator di panel kiri untuk mengetuk absensi secara sukses.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleToggleWebcam}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    id="toggle_camera_btn"
                  >
                    Buka Driver Kamera
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Workspace>
  );
}
