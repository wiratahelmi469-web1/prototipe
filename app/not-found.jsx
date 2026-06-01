// SECTION: Visually Polished Custom 404 Page View
"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, Compass, HelpCircle } from "lucide-react";

export default function CustomNotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center font-sans select-none" id="404-viewport-root">
      
      {/* 404 Visual Icon */}
      <div className="bg-blue-50 border border-blue-100 text-blue-600 p-4.5 rounded-full mb-5 animate-pulse-subtle">
        <GraduationCap className="w-16 h-16 text-blue-650" />
      </div>

      {/* Hero Headings */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">404</h1>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-2 block">
          Maaf, tautan atau halaman portal yang Anda tuju kemungkinan telah dipindahkan atau belum terdaftar dalam sistem akademik.
        </p>
      </div>

      {/* Redirection triggers */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full max-w-xs justify-center">
        <button
          onClick={() => router.push("/")}
          className="py-3 px-5 text-center bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
        >
          Ke Beranda &rarr;
        </button>
        <button
          onClick={() => router.push("/events")}
          className="py-3 px-5 text-center border border-slate-250 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          Cari Event
        </button>
      </div>

    </main>
  );
}
