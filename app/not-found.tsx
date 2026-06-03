import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans">
      {/* Static header placeholder */}
      <header className="bg-white border-b border-stone-200/80 shadow-xs px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
            <Calendar className="w-4 h-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-stone-900">
            EventHub Kampus
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-sm w-full space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-[#F5A623] border border-amber-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <HelpCircle className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#0F1E3C] uppercase tracking-tight">Halaman Tidak Ditemukan</h2>
            <p className="text-xs text-stone-500 leading-relaxed font-semibold">
              Mohon maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan ke alamat lain dalam sistem EventHub Kampus.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#0F1E3C] hover:bg-[#1a315e] text-white text-xs font-black rounded-xl transition shadow-md"
              id="not_found_back_home_btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
