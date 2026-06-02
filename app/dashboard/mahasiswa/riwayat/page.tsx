"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { Calendar, Ticket, Compass } from "lucide-react";
import TicketQRCode from "../../../../components/TicketQRCode";
import Link from "next/link";

export default function RiwayatTiketMahasiswa() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [joinedEvents, setJoinedEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "mahasiswa") {
      router.push("/login");
      return;
    }

    // Load registered lists
    const registeredKey = `registered_${user?.email}_events`;
    const savedRegs = localStorage.getItem(registeredKey);
    let myRegsList: string[] = [];
    if (savedRegs) {
      try { myRegsList = JSON.parse(savedRegs); } catch (e) { myRegsList = []; }
    }

    // Sync from global events catalog
    const savedEvents = localStorage.getItem("eventhub_events");
    let currentEvents: EventItem[] = [];
    if (savedEvents) {
      try { currentEvents = JSON.parse(savedEvents); } catch (e) { currentEvents = INITIAL_EVENTS; }
    } else {
      currentEvents = INITIAL_EVENTS;
    }

    setJoinedEvents(currentEvents.filter((evt) => myRegsList.includes(evt.id)));
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <Workspace id="mahasiswa_tickets_riwayat">
      <div className="max-w-4xl mx-auto space-y-6" id="tickets_riwayat_viewport">
        {/* Page Head */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600" />
            Riwayat &amp; Tiket Akses Saya
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gunakan tiket ber-QR di bawah untuk ditunjukkan kepada petugas di gerbang masuk kegiatan.
          </p>
        </div>

        {/* Tickets stream list */}
        {joinedEvents.length === 0 ? (
          <div className="py-20 text-center bg-white border border-stone-200 rounded-3xl shadow-xs">
            <Compass className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-700">Daftar Tiket Anda Masih Kosong</h4>
            <p className="text-xs text-stone-500 mt-1">Silakan kunjungi Kalender Event Kampus untuk registrasi.</p>
            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 px-4 text-xs font-bold transition-all shadow-xs"
            >
              Cari Event Menarik
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {joinedEvents.map((evt) => (
              <TicketQRCode
                key={evt.id}
                eventId={evt.id}
                eventTitle={evt.title}
                eventDate={evt.date}
                eventLocation={evt.location}
                studentName={user.name}
                studentEmail={user.email}
                ticketNumber={`EH-${evt.id.replace("evt-", "")}-${Math.floor(1000 + Math.random() * 9000)}`}
              />
            ))}
          </div>
        )}
      </div>
    </Workspace>
  );
}
