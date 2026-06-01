// SECTION: Event Display Card Component
"use client";

import Link from "next/link";
import { Calendar, MapPin, Users, CheckCircle, Ticket } from "lucide-react";
import { WARNA_KATEGORI } from "@/lib/constants";

export default function EventCard({ event, onRsvpClick, currentUser, rsvpStatus }) {
  if (!event) return null;

  // Derive gradient color path
  const headerGradient = WARNA_KATEGORI[event.kategori] || "from-slate-500 to-slate-700";

  // Derive display badge colors and wordings of event status
  const statusConfig = {
    buka: { label: "Buka", kelas: "bg-emerald-500 text-white" },
    segera: { label: "Segera", kelas: "bg-amber-500 text-white" },
    selesai: { label: "Selesai", kelas: "bg-slate-500 text-white" },
    tutup: { label: "Tutup", kelas: "bg-red-500 text-white" },
  };

  const statusInfo = statusConfig[event.eventStatus?.toLowerCase()] || { label: event.eventStatus, kelas: "bg-slate-500 text-white" };

  // Calculate quota progress percent
  const kuotaMax = event.kuotaMax || 100;
  const kuotaTerisi = event.kuotaTerisi || 0;
  const persentase = Math.min(100, Math.round((kuotaTerisi / kuotaMax) * 100));
  const isPenuh = persentase >= 100;

  // Check if current user is registered in this event
  const isSudahRsvp = currentUser && event.peserta?.some((p) => p.email.toLowerCase() === currentUser.email.toLowerCase());

  return (
    <div
      id={`event-card-${event.id}`}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col h-full font-sans"
    >
      {/* Banner Top */}
      <div className={`h-32 bg-gradient-to-r ${headerGradient} p-4 flex flex-col justify-between relative`}>
        {/* Category Label */}
        <span className="bg-white/95 backdrop-blur-xs text-slate-800 font-bold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm w-fit">
          {event.kategori}
        </span>

        {/* Event Status Badge */}
        <span className={`absolute top-4 right-4 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md shadow-sm ${statusInfo.kelas}`}>
          {statusInfo.label}
        </span>

        <h3 className="text-white font-extrabold text-sm tracking-tight leading-snug drop-shadow-xs line-clamp-2 select-none">
          {event.nama}
        </h3>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          {/* Tanggal */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-[#1a56db] shrink-0" />
            <span className="truncate font-medium">{event.tanggal} &bull; {event.jam}</span>
          </div>

          {/* Lokasi */}
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-[#1a56db] shrink-0" />
            <span className="truncate font-medium" title={event.lokasi}>{event.lokasi}</span>
          </div>

          {/* Penyelenggara */}
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{event.penyelenggara}</span>
          </div>
        </div>

        {/* Quota Progress meter */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1.5">
            <span className="text-slate-500 font-medium">Kapasitas Peserta</span>
            <span className={`font-bold ${isPenuh ? "text-red-500" : "text-slate-700"}`}>
              {kuotaTerisi} / {kuotaMax} ({persentase}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPenuh ? "bg-red-500" : "bg-[#1a56db]"
              }`}
              style={{ width: `${persentase}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
          <Link
            href={`/events/${event.id}`}
            className="w-full inline-flex items-center justify-center font-bold text-xs text-slate-700 bg-slate-100/80 hover:bg-slate-150 py-2.5 px-3 rounded-xl transition-all cursor-pointer text-center group-hover:scale-[1.02]"
            id={`btn-details-${event.id}`}
          >
            Lihat Detail
          </Link>

          {/* RSVP Button */}
          {isSudahRsvp ? (
            <button
              disabled
              className="w-full inline-flex items-center justify-center gap-1.5 font-bold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 py-2.5 px-3 rounded-xl transition-colors opacity-95 cursor-not-allowed text-center"
              id={`btn-registered-${event.id}`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Terdaftar
            </button>
          ) : event.eventStatus?.toLowerCase() === "tutup" || event.eventStatus?.toLowerCase() === "selesai" || isPenuh ? (
            <button
              disabled
              className="w-full inline-flex items-center justify-center font-bold text-xs text-slate-400 bg-slate-50 border border-slate-200 py-2.5 px-3 rounded-xl transition-colors cursor-not-allowed text-center"
              id={`btn-disabled-rsvp-${event.id}`}
            >
              Tutup
            </button>
          ) : (
            <button
              onClick={() => onRsvpClick && onRsvpClick(event)}
              className="w-full inline-flex items-center justify-center font-bold text-xs text-white bg-[#1a56db] hover:bg-blue-700 py-2.5 px-3 rounded-xl transition-all shadow-sm shadow-blue-500/10 cursor-pointer text-center hover:scale-[1.02]"
              id={`btn-rsvp-${event.id}`}
            >
              RSVP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
