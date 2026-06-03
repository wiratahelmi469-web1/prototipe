"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Calendar } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error boundary caught an exception:", error);
  }, [error]);

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
          <div className="w-16 h-16 bg-red-150 text-red-700 border border-red-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8 animate-shake" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-navy uppercase tracking-tight font-heading">Terjadi Kesalahan</h2>
            <p className="text-xs text-gray-muted leading-relaxed font-semibold">
              Terjadi kendala teknis saat memuat modul halaman ini. Silakan coba memuat ulang atau kembali ke Beranda.
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-2 font-heading">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gold hover:bg-gold-dark text-navy text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
              id="error_retry_btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Coba Lagi
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-[#E2E8F0] hover:bg-navy-tint text-navy text-xs font-bold rounded-xl transition"
              id="error_home_btn"
            >
              Beranda
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
