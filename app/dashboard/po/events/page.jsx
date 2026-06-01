// SECTION: PO Event Monitoring Directory
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Calendar, Users, Eye, HelpCircle, CheckCircle, Clock } from "lucide-react";
import useEvents from "@/hooks/useEvents";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";

export default function PoEventsOverview() {
  const router = useRouter();
  const { events } = useEvents();

  return (
    <ProtectedRoute allowedRoles={["po"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="po-events-overview-root">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Monitoring Event Kampus
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
              Pantau segenap status kegiatan kepanitiaan mahasiswa yang aktif di Universitas Nurul Fikri beserta persentase kuota masing-masing.
            </p>
          </div>
        </div>

        {/* LIST TABLET/MOBILE CARDS VIEW */}
        {events.length === 0 ? (
          <EmptyState
            judul="Kegiatan Masih Kosong"
            deskripsi="Belum ada data event tersimpan di sistem."
            ikon={Layers}
          />
        ) : (
          <div className="bg-white border rounded-3xl border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wider">
              Daftar Semua Kegiatan Terdaftar
            </h3>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-2">Event</th>
                    <th className="pb-3 px-2">Kategori</th>
                    <th className="pb-3 px-2">Divisi Penyelenggara</th>
                    <th className="pb-3 px-2 font-mono">Pendaftar/Kuota Max</th>
                    <th className="pb-3 px-2">Status Administrasi</th>
                    <th className="pb-3 pl-2 text-right">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {events.map((e) => {
                    const statusTag = {
                      approved: "text-emerald-700 bg-emerald-50 border-emerald-100",
                      pending_approval: "text-amber-700 bg-amber-50 border-amber-100",
                      rejected: "text-red-700 bg-red-50 border-red-100"
                    };

                    return (
                      <tr key={e.id} id={`po-evt-row-${e.id}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-2">
                          <p className="font-bold text-slate-950 truncate max-w-[180px]">{e.nama}</p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{e.tanggal}</span>
                        </td>
                        <td className="py-4 px-2 whitespace-nowrap">{e.kategori}</td>
                        <td className="py-4 px-2 truncate max-w-[140px]" title={e.penyelenggara}>{e.penyelenggara}</td>
                        <td className="py-4 px-2 whitespace-nowrap font-bold text-slate-900">{e.kuotaTerisi} / {e.kuotaMax}</td>
                        <td className="py-4 px-2 whitespace-nowrap">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 border rounded-lg ${statusTag[e.status]}`}>
                            {e.status === "approved" ? "Aktif" : e.status === "pending_approval" ? "Persetujuan" : "Ditolak"}
                          </span>
                        </td>
                        <td className="py-4 pl-2 text-right">
                          <button
                            onClick={() => router.push(`/events/${e.id}`)}
                            className="inline-flex items-center gap-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] py-1.5 px-3 rounded-lg cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
