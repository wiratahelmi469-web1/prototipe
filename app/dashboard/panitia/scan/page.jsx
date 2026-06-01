// SECTION: Panitia Presensi Scan (QR & NIM Manual Check-in)
"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Camera, 
  Keyboard, 
  HelpCircle, 
  RotateCcw, 
  QrCode, 
  CheckCircle,
  AlertSquare
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";
import ScanResult from "@/components/ScanResult";

export default function CameraPresensiPage() {
  const { user } = useAuth();
  const { events, checkinParticipant } = useEvents();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("camera"); // "camera" | "manual"
  const [targetEventId, setTargetEventId] = useState("");
  
  // Manual text states
  const [manualNim, setManualNim] = useState("");

  // Scan Outcome Displays
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [isDuplicated, setIsDuplicated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const scannerRef = useRef(null);

  // Filter approved events owned by this specific panitia
  const myApprovedEvents = events.filter(
    (e) => e.status === "approved" && e.pengajuEmail?.toLowerCase() === user?.email?.toLowerCase() && e.eventStatus !== "segera"
  );

  useEffect(() => {
    // Automatically pre-select first event if any
    if (myApprovedEvents.length > 0 && !targetEventId) {
      setTimeout(() => {
        setTargetEventId((prev) => !prev && myApprovedEvents.length > 0 ? myApprovedEvents[0].id : prev);
      }, 0);
    }
  }, [myApprovedEvents, targetEventId]);

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear().catch((error) => console.log("Clear error:", error));
      } catch (err) {
        console.error("Cleanup scanner failed:", err);
      }
      scannerRef.current = null;
    }
  };

  function onScanSuccess(decodedText) {
    try {
      // Decode QR Code json payload
      const data = JSON.parse(decodedText);
      
      if (!data.eventId || !data.userEmail) {
        triggerFeedbackMsg(null, "Format QR Code tidak terstruktur resmi.", false);
        return;
      }

      if (data.eventId !== targetEventId) {
        triggerFeedbackMsg(null, "QR Tiket ini untuk agenda event yang berbeda.", false);
        return;
      }

      // Execute persistence register check-in
      processCheckinAction(data.eventId, data.userEmail, data.nama, data.nim);
    } catch (err) {
      triggerFeedbackMsg(null, "Format QR Code salah atau tidak dapat dibaca.", false);
    }
  }

  function onScanFailure(error) {
    // Silent failure as it scans frame-by-frame
  }

  // CAMERA SCANNER INITIALIZATION (Wrapped inside client-only scope)
  useEffect(() => {
    if (activeTab !== "camera" || !targetEventId) {
      cleanupScanner();
      return;
    }

    let html5QrcodeScanner = null;

    try {
      if (typeof window !== "undefined") {
        const { Html5QrcodeScanner } = require("html5-qrcode");

        html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-scanner-viewport",
          { 
            fps: 8, 
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0 
          },
          /* verbose= */ false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = html5QrcodeScanner;
      }
    } catch (e) {
      console.warn("Camera init failed:", e);
    }

    return () => {
      cleanupScanner();
    };
  }, [activeTab, targetEventId]);

  function processCheckinAction(eventId, email, nama, nim) {
    const res = checkinParticipant(eventId, email);

    if (res.success) {
      // Trigger success overlays
      triggerFeedbackMsg({ nama, nim }, "", res.isDuplicated);
    } else {
      triggerFeedbackMsg(null, res.error, false);
    }
  }

  // Helper trigger popups displays
  function triggerFeedbackMsg(clientObj, errText, duplicatedState) {
    setScanData(clientObj);
    setErrorMsg(errText);
    setIsDuplicated(duplicatedState);
    setScanResultOpen(true);
    
    // Pause scanner if possible or handle visual alert
    cleanupScanner();
  }

  // Manual Checkin executor
  const handleManualCheckInSubmit = (e) => {
    e.preventDefault();

    if (!targetEventId) {
      showToast("Pilih event kepanitiaan Anda terlebih dahulu.", "error");
      return;
    }
    if (!manualNim.trim()) {
      showToast("Wajib mengisikan NIM atau Email mahasiswa.", "error");
      return;
    }

    // Try finding event
    const activeEvt = events.find((item) => item.id === targetEventId);
    if (!activeEvt) {
      showToast("Event tidak ditemukan.", "error");
      return;
    }

    // Search inside peserta list matching NIM or email
    const studentMatch = activeEvt.peserta?.find((p) =>
      p.nim?.toLowerCase() === manualNim.trim().toLowerCase() ||
      p.email?.toLowerCase() === manualNim.trim().toLowerCase()
    );

    if (!studentMatch) {
      triggerFeedbackMsg(null, `NIM/Email "${manualNim}" belum melakukan RSVP di event ini.`, false);
      return;
    }

    processCheckinAction(targetEventId, studentMatch.email, studentMatch.nama, studentMatch.nim);
    setManualNim(""); // Clear input form
  };

  const handleResultClosed = () => {
    setScanResultOpen(false);
    // Restart Camera loop if on camera tab
    if (activeTab === "camera") {
      setActiveTab("");
      setTimeout(() => setActiveTab("camera"), 100);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["panitia"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="panitia-camera-scanner-root">
        
        {/* HEADER */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Presensi Check-in Kehadiran
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
            Pindai QR Tiket masuk mandiri milik mahasiswa, atau lakukan registrasi NIM manual jika kamera terkendala.
          </p>
        </div>

        {/* CONTROLS BAR: EVENT SELECTION AND TAB TAPE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs items-center justify-between">
          
          {/* Selector Event */}
          <div className="space-y-1">
            <label htmlFor="select-scan-evt" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pilih Event Tanggung Jawab Anda</label>
            {myApprovedEvents.length === 0 ? (
              <span className="text-xs text-slate-400 font-medium block italic">Belum ada event berstatus rilis/berjalan.</span>
            ) : (
              <select
                id="select-scan-evt"
                value={targetEventId}
                onChange={(e) => {
                  cleanupScanner();
                  setTargetEventId(e.target.value);
                }}
                className="w-full bg-slate-50 border border-slate-250 text-slate-800 text-xs py-2.5 px-3.5 rounded-xl cursor-pointer font-bold"
              >
                {myApprovedEvents.map((e) => (
                  <option key={e.id} value={e.id}>{e.nama} ({e.kategori})</option>
                ))}
              </select>
            )}
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl self-end h-[42px]">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                activeTab === "camera" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Camera className="w-4 h-4 text-purple-600" />
              Scan QR Kamera
            </button>
            <button
              onClick={() => {
                cleanupScanner();
                setActiveTab("manual");
              }}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 font-bold text-xs rounded-lg transition-colors cursor-pointer ${
                activeTab === "manual" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              id="tab-btn-scan-manual"
            >
              <Keyboard className="w-4 h-4 text-[#1a56db]" />
              Input NIM Manual
            </button>
          </div>
        </div>

        {/* MAIN VIEWER LAYOUT PANELS */}
        <div className="max-w-md mx-auto">
          {myApprovedEvents.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl p-6 select-none">
              <span className="inline-block bg-purple-50 text-purple-600 p-4 border border-purple-100 rounded-full mb-3 mb-4">
                <QrCode className="w-10 h-10" />
              </span>
              <p className="font-extrabold text-sm text-slate-800">Tidak Ada Event Terbuka</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
                Lakukan pengajuan usulan event baru terlebih dahulu, atau ubah status event menjadi &quot;BUKA / TUTUP REGISTRASI&quot; agar dapat diproses kehadirannya.
              </p>
            </div>
          ) : activeTab === "camera" ? (
            
            /* TAB 1: CAMERA RENDER VIEWPORT */
            <div className="space-y-4">
              <div className="bg-white border rounded-3xl p-4 border-slate-200 shadow-xs overflow-hidden">
                <p className="text-center font-bold text-[11px] text-slate-400 uppercase tracking-widest mb-3 select-none">Arahkan QR Tiket Ke Kamera</p>
                
                {/* HTML5 QRCODE ID ELEMENT */}
                <div 
                  id="qr-scanner-viewport" 
                  className="overflow-hidden rounded-2xl border border-slate-100 bg-black min-h-[250px] w-full" 
                />
              </div>

              <div className="p-3.5 bg-blue-50 text-blue-900 border border-blue-100 rounded-2xl text-[10.5px] leading-relaxed select-none">
                <p className="font-bold flex items-center gap-1 text-blue-950 mb-0.5">ℹ️ Tip Presensi:</p>
                Pastikan cahaya mencukupi dan posisi QR Code berada di dalam kotak pemindai. Kamera akan membaca secara real-time. Jika terkendala izin, silakan beralih ke tab <strong>Input NIM Manual</strong>.
              </div>
            </div>
          ) : (
            
            /* TAB 2: MANUAL INTEGRITY CHECK-IN FALLBACK FORM */
            <div className="bg-white border text-center rounded-3xl border-slate-200 p-6 shadow-xs space-y-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-1">
                <Keyboard className="w-7 h-7" />
              </div>
              <div className="space-y-1 select-none">
                <h4 className="font-extrabold text-slate-900 text-sm">Registrasi Kehadiran Manual</h4>
                <p className="text-[11px] text-slate-500">Cari NIM/Email pendaftar mahasiswa untuk verifikasi instan.</p>
              </div>

              <form onSubmit={handleManualCheckInSubmit} className="space-y-4">
                <div className="space-y-1 text-left">
                  <label htmlFor="inp-manual-val" className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">NIM ATAU EMAIL INSTITUSI</label>
                  <input
                    id="inp-manual-val"
                    type="text"
                    required
                    placeholder="Contoh: 20211029 atau mhs@nurulfikri.ac.id"
                    value={manualNim}
                    onChange={(e) => setManualNim(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white p-3 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3.5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  id="btn-process-manual-checkin"
                >
                  VERIFIKASI HADIR &rarr;
                </button>
              </form>
            </div>
          )}
        </div>

        {/* SCAN outcome modals displaying overlays */}
        <Modal
          isOpen={scanResultOpen}
          onClose={handleResultClosed}
          title="Verifikasi Presensi Kampus"
        >
          <ScanResult
            scanData={scanData}
            errorMsg={errorMsg}
            isDuplicated={isDuplicated}
            onClose={handleResultClosed}
          />
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
