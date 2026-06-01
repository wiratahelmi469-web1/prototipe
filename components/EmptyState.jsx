// SECTION: Custom Empty Database State Wrapper
"use client";

import { Calendar } from "lucide-react";

export default function EmptyState({ 
  judul = "Tidak Ada Data", 
  deskripsi = "Belum ada catatan yang ditemukan dalam folder ini.", 
  ikon: Ikon = Calendar, 
  tombolLabel, 
  onTombolClick 
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs font-sans">
      <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 mb-4 inline-flex items-center justify-center border border-slate-100">
        <Ikon className="w-8 h-8 text-[#1a56db]" />
      </div>
      <h3 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight select-none mb-1">
        {judul}
      </h3>
      <p className="text-xs md:text-sm text-slate-500 leading-normal max-w-sm mb-6 select-none">
        {deskripsi}
      </p>

      {tombolLabel && onTombolClick && (
        <button
          onClick={onTombolClick}
          className="inline-flex items-center justify-center font-bold text-xs text-white bg-[#1a56db] hover:bg-blue-700 py-3 px-5 rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer text-center hover:scale-[1.02]"
          id="empty-state-action-btn"
        >
          {tombolLabel}
        </button>
      )}
    </div>
  );
}
