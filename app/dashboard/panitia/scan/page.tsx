"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { parseAndValidateQR } from "../../../../lib/scanUtils";
import { ScanLine, Sparkles, AlertCircle, PlayCircle, ShieldAlert, Monitor, UserCheck, CameraOff, CheckCircle } from "lucide-react";
import ScanResult from "../../../../components/ScanResult";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function QRScannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("evt-01");

  // Scanner status and state variables
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<any | null>(null);
  const scannerRef = useRef<any>(null);
  const scannerDivId = "qr-reader-viewport";

  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "panitia") {
      router.push("/login");
      return;
    }

    // Sync / Load events
    const savedEvents = localStorage.getItem("eventhub_events");
    if (savedEvents) {
      try { setEvents(JSON.parse(savedEvents)); } catch (e) { setEvents(INITIAL_EVENTS); }
    } else {
      setEvents(INITIAL_EVENTS);
    }
  }, [user, loading, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
          .then(() => { scannerRef.current = null; })
          .catch((e: any) => console.log(e));
      }
    };
  }, []);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.error("Gagal menghentikan kamera", e);
      }
      scannerRef.current = null;
    }
    setScannerActive(false);
  };

  const startScanner = async () => {
    setScannerActive(true);
    setCameraError(null);
    setCurrentResult(null);

    // Wait for the DOM element to load
    await new Promise(r => setTimeout(r, 200));

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode(scannerDivId);
      scannerRef.current = qr;

      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const parsed = parseAndValidateQR(decodedText, selectedEventId);
          setCurrentResult(parsed);
          stopScanner();

          if (parsed.isValid) {
            addToast("Kehadiran berhasil dicatat!", "success");
            const presenceKey = `presence_${selectedEventId}_students`;
            const savedPresences = localStorage.getItem(presenceKey);
            let presList: string[] = [];
            if (savedPresences) {
              try { presList = JSON.parse(savedPresences); } catch (e) {}
            }
            if (parsed.studentEmail && !presList.includes(parsed.studentEmail)) {
              localStorage.setItem(presenceKey, JSON.stringify([...presList, parsed.studentEmail]));
            }
          } else {
            addToast(parsed.message, "error");
          }
        },
        () => {} // onScanFailure: ignore
      );
    } catch (err: any) {
      console.error(err);
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission") || err?.message?.includes("NotAllowedError")) {
        setCameraError("Izin kamera ditolak oleh browser. Silakan izinkan akses kamera pada peramban Anda.");
      } else {
        setCameraError("Kamera gawai Anda tidak dapat diakses atau sedang digunakan oleh aplikasi lain.");
      }
      setScannerActive(false);
    }
  };

  if (loading || !user) return null;

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

            {/* Scan Tips Panel */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                📌 TIPS PENGGUNAAN SCANNER
              </h4>
              <ul className="text-xs text-stone-605 space-y-2 list-disc list-inside">
                <li>Gunakan Chrome/Safari terbaru</li>
                <li>Halaman harus diakses via HTTPS</li>
                <li>Izinkan akses kamera saat diminta browser</li>
                <li>Arahkan kamera ke QR Code mahasiswa</li>
              </ul>
            </div>
          </div>

          {/* Core Interactive Scanner screen */}
          <div className="col-span-1 md:col-span-2">
            {/* KONDISI 1 - Ada hasil scan */}
            {currentResult ? (
              <div className="animate-in zoom-in-95 duration-150 space-y-4">
                <ScanResult result={currentResult} onReset={() => setCurrentResult(null)} />
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setCurrentResult(null);
                      startScanner();
                    }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Scan Berikutnya
                  </button>
                </div>
              </div>
            ) : cameraError ? (
              /* KONDISI 2 - Kamera error */
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[350px] text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-220 flex items-center justify-center text-rose-500">
                  <CameraOff className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-stone-850">Gagal Mengakses Kamera</h4>
                <p className="text-xs text-rose-650 max-w-sm leading-relaxed">
                  {cameraError}
                </p>
                <button
                  onClick={startScanner}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            ) : scannerActive ? (
              /* KONDISI 3 - Scanner aktif */
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[350px] space-y-4">
                <div className="w-full max-w-md rounded-2xl overflow-hidden border border-stone-200 relative bg-stone-950">
                  <div id={scannerDivId} className="w-full aspect-square" />
                  <div className="absolute inset-0 border-2 border-indigo-500 pointer-events-none rounded-xl m-12 animate-pulse opacity-40" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-indigo-650 font-bold animate-pulse">Menunggu QR Code...</p>
                  <p className="text-[10px] text-stone-400">Posisikan QR Code mahasiswa tepat di dalam kotak bidik kamera</p>
                </div>
                <button
                  onClick={stopScanner}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Tutup Kamera
                </button>
              </div>
            ) : (
              /* KONDISI 4 - Default (idle) */
              <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[350px] text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-stone-50 border border-stone-220 flex items-center justify-center text-stone-400">
                  <ScanLine className="w-10 h-10 animate-pulse text-indigo-500" />
                </div>
                
                <h4 className="text-sm font-bold text-stone-850">Luncurkan Pindai Web Kamera</h4>
                <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                  Posisikan scanner di pintu masuk penonton. Kamera Anda akan membaca kode QR milik tiket mahasiswa untuk didaftarkan langsung di database kehadiran.
                </p>

                <button
                  onClick={startScanner}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                  id="start_scan_btn"
                >
                  Buka Kamera &amp; Scan QR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Workspace>
  );
}
