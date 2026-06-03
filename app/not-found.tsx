import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-off-white text-gray-dark flex flex-col font-body">
      {/* Static header placeholder */}
      <header className="bg-white border-b border-[#E2E8F0] shadow-xs px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-navy text-white shadow-sm">
            <Calendar className="w-4 h-4" />
          </span>
          <span className="text-sm font-bold tracking-tight text-navy font-heading">
            EventHub Kampus
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-sm w-full space-y-6">
          <div className="w-16 h-16 bg-gold-tint text-gold border border-gold-tint rounded-full flex items-center justify-center mx-auto shadow-inner">
            <HelpCircle className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-navy uppercase tracking-tight font-heading">Halaman Tidak Ditemukan</h2>
            <p className="text-xs text-gray-muted leading-relaxed font-semibold">
              Mohon maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan ke alamat lain dalam sistem EventHub Kampus.
            </p>
          </div>

          <div className="pt-2 font-heading">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-navy hover:bg-navy-mid text-white text-xs font-black rounded-xl transition shadow-md hover:text-gold"
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
