// SECTION: Client-Side Route Protection Component
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, RefreshCw } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const isAuthorized = !loading && user && (allowedRoles.length === 0 || allowedRoles.includes(user.role));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-slate-500 font-sans gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs font-semibold">Memeriksa hak akses...</span>
      </div>
    );
  }

  if (!user) return null;

  if (!isAuthorized) {
    // Return Access Denied View inline
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto shadow-sm tracking-tight mt-10 font-sans animate-slide-in">
        <div className="bg-red-50 p-4 rounded-2xl text-red-600 mb-5 inline-flex items-center justify-center border border-red-150">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="font-extrabold text-[#ef4444] text-lg md:text-xl tracking-tight select-none mb-2">
          Akses Ditolak
        </h2>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6 max-w-xs">
          Anda tidak memiliki izin atau kewenangan untuk mengakses halaman kelola ini.
        </p>

        <button
          onClick={() => router.push(`/dashboard/${user.role}`)}
          className="inline-flex items-center justify-center font-bold text-xs text-white bg-[#1a56db] hover:bg-blue-700 py-3 px-5 rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer text-center hover:scale-[1.02]"
          id="btn-return-denied"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
