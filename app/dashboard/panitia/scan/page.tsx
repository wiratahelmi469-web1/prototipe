"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { parseAndValidateQR } from "../../../../lib/scanUtils";
import { 
  ScanLine, 
  Sparkles, 
  AlertCircle, 
  PlayCircle, 
  ShieldAlert, 
  Monitor, 
  UserCheck, 
  CameraOff, 
  CheckCircle,
  Search,
  Loader2,
  XCircle,
  X
} from "lucide-react";
import ScanResult from "../../../../components/ScanResult";
import Toast, { ToastContainer } from "../../../../components/Toast";

// Mock student lists for fallback attendance manual
const MOCK_PARTICIPANTS = [
  { name: "Ahmad Junaidi", nim: "0110221044", email: "mahasiswa@nurulfikri.ac.id" },
  { name: "Siti Khadijah", nim: "0110221085", email: "siti.khadijah@nurulfikri.ac.id" },
  { name: "Rian Kurniawan", nim: "0110221190", email: "rian.kurniawan@nurulfikri.ac.id" },
  { name: "Farhan Ramadhan", nim: "0110221235", email: "farhan.ramadhan@nurulfikri.ac.id" },
  { name: "Aisyah Putri", nim: "0110221312", email: "aisyah.putri@nurulfikri.ac.id" },
  { name: "Budi Santoso", nim: "0110221402", email: "budi.santoso@nurulfikri.ac.id" },
  { name: "Clara Amalia", nim: "0110221450", email: "clara.amalia@nurulfikri.ac.id" }
];


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

  // Manual attendance state variables
  const [presenceList, setPresenceList] = useState<string[]>([]);
  const [registrants, setRegistrants] = useState<{ name: string; nim: string; email: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ name: string; nim: string; email: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState<string | null>(null);

  // Sync presences and registrants list when event changes
  useEffect(() => {
    if (!selectedEventId) return;

    // 1. Sync presence list
    const presenceKey = `presence_${selectedEventId}_students`;
    const savedPresences = localStorage.getItem(presenceKey);
    let presList: string[] = [];
    if (savedPresences) {
      try { presList = JSON.parse(savedPresences); } catch (e) {}
    }
    setPresenceList(presList);

    // 2. Load or pre-populate registered students for this event
    const updatedRegistrantsList: { name: string; nim: string; email: string }[] = [];

    MOCK_PARTICIPANTS.forEach(student => {
      const regKey = `registered_${student.email}_events`;
      const savedRegs = localStorage.getItem(regKey);
      let myRegsList: string[] = [];
      if (savedRegs) {
        try { myRegsList = JSON.parse(savedRegs); } catch (e) {}
      } else {
        // Pre-populate some registrations based on student emails for demo
        const defaultRegs: string[] = [];
        if (student.email === "mahasiswa@nurulfikri.ac.id") {
          defaultRegs.push("evt-01", "evt-02", "evt-04");
        } else if (student.email.includes("siti") || student.email.includes("farhan")) {
          defaultRegs.push("evt-01", "evt-03");
        } else if (student.email.includes("rian") || student.email.includes("aisyah")) {
          defaultRegs.push("evt-01", "evt-02");
        } else {
          defaultRegs.push("evt-02", "evt-04");
        }
        localStorage.setItem(regKey, JSON.stringify(defaultRegs));
        myRegsList = defaultRegs;
      }

      if (myRegsList.includes(selectedEventId)) {
        updatedRegistrantsList.push(student);
      }
    });

    setRegistrants(updatedRegistrantsList);
  }, [selectedEventId]);

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const delayDebounce = setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      const filtered = registrants.filter(
        r => r.name.toLowerCase().includes(query) || r.nim.includes(query) || r.email.toLowerCase().includes(query)
      );
      setSearchResults(filtered);
      setSearchLoading(false);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, registrants]);

  const handleTogglePresence = async (studentEmail: string, studentName: string, isMarkingPresent: boolean) => {
    setSubmitLoading(studentEmail);
    
    // Simulate API/network submission lag
    await new Promise(resolve => setTimeout(resolve, 600));

    const presenceKey = `presence_${selectedEventId}_students`;
    const savedPresences = localStorage.getItem(presenceKey);
    let presList: string[] = [];
    if (savedPresences) {
      try { presList = JSON.parse(savedPresences); } catch (e) {}
    }

    let updatedList: string[] = [];
    if (isMarkingPresent) {
      if (!presList.includes(studentEmail)) {
        updatedList = [...presList, studentEmail];
        addToast(`Sukses mencatat kehadiran ${studentName}!`, "success");
      } else {
        updatedList = presList;
      }
    } else {
      updatedList = presList.filter(email => email !== studentEmail);
      addToast(`Kehadiran ${studentName} berhasil dibatalkan.`, "info");
    }

    localStorage.setItem(presenceKey, JSON.stringify(updatedList));
    setPresenceList(updatedList);
    setSubmitLoading(null);
  };

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
              const newList = [...presList, parsed.studentEmail];
              localStorage.setItem(presenceKey, JSON.stringify(newList));
              setPresenceList(newList);
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

            {/* SECTION: Absensi Manual */}
            <div className="bg-white border border-stone-200 border-t-4 border-t-[#F5A623] rounded-2xl p-6 shadow-xs space-y-5" id="absensi_manual_card">
              <div>
                <h3 className="text-sm font-black text-[#0F1E3C] uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#F5A623]" />
                  Absensi Manual Fallback
                </h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                  Gunakan fitur pencarian di bawah ini untuk mencatatkan kehadiran peserta secara manual apabila QR Code pada tiket elektronik mahasiswa rusak atau bermasalah.
                </p>
              </div>

              {/* Search input bar */}
              <div className="relative">
                <input
                  type="text"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 pr-10 outline-hidden focus:border-[#0F1E3C] focus:bg-white transition-all font-semibold text-stone-850"
                  placeholder="Cari berdasarkan Nama, NIM, atau Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search loading or result list */}
              {searchLoading ? (
                <div className="py-8 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl space-y-2 animate-pulse">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#F5A623]" />
                  <div className="text-xs font-semibold text-stone-600">Mencari Data Peserta...</div>
                </div>
              ) : searchQuery ? (
                searchResults.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl space-y-2">
                    <XCircle className="w-8 h-8 mx-auto text-rose-300" />
                    <div className="text-xs font-semibold text-stone-600">Peserta Tidak Ditemukan</div>
                    <p className="text-[10px] text-stone-400 max-w-xs mx-auto">
                      Tidak ada peserta terdaftar dengan kata kunci "{searchQuery}" pada event "{selectedEvent.title}" ini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {searchResults.map((student) => {
                      const isPresent = presenceList.includes(student.email);
                      const isRowLoading = submitLoading === student.email;

                      return (
                        <div 
                          key={student.email} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-stone-150 rounded-xl hover:bg-stone-50/40 transition-colors gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#0F1E3C]">{student.name}</span>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isPresent 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {isPresent ? "Hadir" : "Belum Hadir"}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-stone-500 flex flex-wrap gap-x-3 gap-y-1">
                              <span>NIM: <strong className="text-stone-700">{student.nim}</strong></span>
                              <span className="text-stone-300">|</span>
                              <span>Email: <span className="text-stone-600">{student.email}</span></span>
                            </div>
                          </div>

                          <div>
                            {isPresent ? (
                              <button
                                onClick={() => handleTogglePresence(student.email, student.name, false)}
                                disabled={submitLoading !== null}
                                className="w-full sm:w-auto px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {isRowLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-700" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                                Batalkan Kehadiran
                              </button>
                            ) : (
                              <button
                                onClick={() => handleTogglePresence(student.email, student.name, true)}
                                disabled={submitLoading !== null}
                                className="w-full sm:w-auto px-4 py-2 bg-[#0F1E3C] hover:bg-[#1a315e] text-[#F5A623] border border-[#0F1E3C] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs"
                              >
                                {isRowLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F5A623]" />
                                ) : (
                                  <CheckCircle className="w-3.5 h-3.5 text-[#F5A623]" />
                                )}
                                Tandai Hadir
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="py-8 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl space-y-2">
                  <Search className="w-8 h-8 mx-auto text-stone-300" />
                  <div className="text-xs font-semibold text-[#0F1E3C]">Siap Mencari Peserta</div>
                  <p className="text-[10px] text-stone-400">
                    Masukkan kata kunci Nama atau NIM peserta terdaftar di atas untuk memulai absensi manual.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
