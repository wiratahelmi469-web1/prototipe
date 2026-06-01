// SECTION: QR Code Scan Result Popup Card
"use client";

import { CheckCircle, XCircle, AlertTriangle, UserCheck } from "lucide-react";

export default function ScanResult({ scanData, errorMsg, isDuplicated, onClose }) {
  return (
    <div className="bg-white p-5 border rounded-2xl border-slate-150 shadow-xs text-center flex flex-col items-center gap-4 max-w-sm w-full select-none font-sans mx-auto">
      
      {/* CASE 1: VALID ABSENSI PRESENSI SUCCESS */}
      {scanData && !errorMsg && !isDuplicated && (
        <>
          <div className="p-3.5 bg-emerald-50 text-[#10b981] border border-emerald-100 rounded-full animate-pulse-subtle">
            <UserCheck className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-md">PRESENSI HADIR</span>
            <h4 className="font-extrabold text-slate-900 text-sm mt-3.5 leading-snug">{scanData.nama}</h4>
            <p className="text-[11px] text-slate-450 font-mono font-bold mt-1 uppercase">NIM: {scanData.nim || "GUEST"}</p>
          </div>
          <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
            Status presensi keikutseraan mahasiswa sukses terverifikasi hadir di pangkalan data acara.
          </p>
        </>
      )}

      {/* CASE 2: DUPLICATED SCANS (ALREADY PRESENTED) */}
      {scanData && isDuplicated && (
        <>
          <div className="p-3.5 bg-amber-50 text-[#f59e0b] border border-amber-100 rounded-full">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest font-black text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-md">DUPLIKAT ABSEN</span>
            <h4 className="font-extrabold text-slate-900 text-sm mt-3.5 leading-snug">{scanData.nama}</h4>
            <p className="text-[11px] text-slate-450 font-mono font-bold mt-1 uppercase">NIM: {scanData.nim || "GUEST"}</p>
          </div>
          <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
            Mahasiswa sudah berstatus hadir sebelumnya. Presensi tidak dihitung ganda.
          </p>
        </>
      )}

      {/* CASE 3: EXPLICIT FAILS OR BAD DECODES */}
      {errorMsg && (
        <>
          <div className="p-3.5 bg-red-50 text-[#ef4444] border border-red-100 rounded-full">
            <XCircle className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[10px] tracking-widest font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-md">GAGAL VERIFIKASI</span>
            <h4 className="font-extrabold text-slate-900 text-xs mt-3.5 leading-normal max-w-[200px] mx-auto">{errorMsg}</h4>
          </div>
          <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
            QR Code tidak resmi, usul pendaftaran belum terverifikasi PO, atau mahasiswa dilarang menghadiri forum.
          </p>
        </>
      )}

      {/* DISMISS TRIGGERS */}
      <button
        onClick={onClose}
        className="w-full bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-colors mt-2"
        id="btn-scan-dismiss"
      >
        Lanjutkan Scan &rarr;
      </button>
    </div>
  );
}
