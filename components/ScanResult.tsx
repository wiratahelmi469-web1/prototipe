"use client";

import React from "react";
import { Check, X, ShieldAlert, Clock, UserCheck } from "lucide-react";
import { ScannedTicketResult } from "../lib/scanUtils";

interface ScanResultProps {
  result: ScannedTicketResult;
  onReset: () => void;
}

export default function ScanResult({ result, onReset }: ScanResultProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center shadow-lg max-w-sm w-full mx-auto" id="scan_result_viewport">
      {result.isValid ? (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
            <UserCheck className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-stone-800">Absensi Berhasil!</h4>
          <p className="text-xs text-stone-500 mt-1">Sertifikat kehadiran akan diperbarui secara otomatis.</p>

          <div className="bg-stone-50 rounded-xl p-4 w-full my-4 text-left border border-stone-100 space-y-2">
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Nama Lengkap</p>
              <p className="text-sm font-semibold text-stone-700">{result.studentName}</p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Email Universitas</p>
              <p className="text-sm font-semibold text-stone-700">{result.studentEmail}</p>
            </div>
            {result.eventTitle && (
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Event Kampus</p>
                <p className="text-xs font-medium text-stone-600 line-clamp-1">{result.eventTitle}</p>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[10px] text-stone-400 pt-1.5 border-t border-stone-200/55">
              <Clock className="w-3 h-3" />
              <span>Dicatat pukul: {result.scannedAt}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-stone-800">Verifikasi Gagal</h4>
          <p className="text-xs text-stone-500 mt-1">Silakan minta tiket asli atau laporkan ke PO jika error.</p>

          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 w-full my-4 text-left">
            <p className="text-xs font-medium text-rose-800 leading-relaxed">
              {result.message}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl transition-all"
        id="scan_reset_btn"
      >
        Scan Tiket Berikutnya
      </button>
    </div>
  );
}
