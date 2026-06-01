// SECTION: Guest Dashboard View Page
"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Compass, ArrowRight } from "lucide-react";
import useEvents from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import StatsCard from "@/components/StatsCard";

export default function GuestDashboard() {
  const router = useRouter();
  const { events } = useEvents();

  // Highlight 3 approved upcoming events on the guest home
  const approvedEvents = events.filter((e) => e.status === "approved").slice(0, 3);

  const handleGuestRsvp = () => {
    router.push("/login");
  };

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in" id="dashboard-guest-root">
      
      {/* BANNER GUEST WARNING */}
      <div className="bg-amber-50 border border-amber-250/60 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5 text-center sm:text-left">
          <div className="bg-amber-500/15 p-2 rounded-xl text-amber-600 shrink-0 mt-0.5 inline-flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-amber-950">Anda Masuk Sebagai Tamu</h3>
            <p className="text-[11px] text-slate-500 font-medium leading-normal mt-0.5">
              RSVP pendaftaran agenda, kepanitiaan presensi QR-code, serta klaim sertifikat digital diwajibkan melakukan masuk login terlebih dahulu.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 px-5 rounded-xl transition-all hover:scale-[1.02] cursor-pointer shrink-0"
        >
          Login Sekarang &rarr;
        </button>
      </div>

      {/* QUICK STATS CARD OVERVIEWS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard
          title="Total Agenda Kampus"
          value={events.filter((e) => e.status === "approved").length}
          icon={Compass}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Status Akun"
          value="TAMU"
          icon={AlertTriangle}
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      {/* HEADER SECTION FOR EVENTS LIST */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
        <h3 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight uppercase">Event Terbaru NF</h3>
        <button
          onClick={() => router.push("/events")}
          className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          Lihat Semua
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* EVENTS CARD GRID */}
      {approvedEvents.length === 0 ? (
        <div className="bg-white border p-12 text-center rounded-2xl border-slate-200">
          <p className="text-sm text-slate-400 font-medium">Belum ada agenda diumumkan saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              currentUser={null} // Read-only RSVP buttons logic
              onRsvpClick={handleGuestRsvp}
            />
          ))}
        </div>
      )}
    </div>
  );
}
