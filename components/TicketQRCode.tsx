"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Calendar, MapPin, User, Download } from "lucide-react";
import { generateTicketQRPayload } from "../lib/scanUtils";

interface TicketProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  studentName: string;
  studentEmail: string;
  ticketNumber: string;
}

export default function TicketQRCode({
  eventId,
  eventTitle,
  eventDate,
  eventLocation,
  studentName,
  studentEmail,
  ticketNumber
}: TicketProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    const drawQR = async () => {
      try {
        const payload = generateTicketQRPayload(eventId, eventTitle, studentEmail, studentName);
        await QRCode.toCanvas(canvasRef.current, payload, {
          width: 140,
          margin: 1,
          color: {
            dark: "#1e1b4b", // deep indigo
            light: "#ffffff"
          }
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to generate QR Code: ", err);
      }
    };
    drawQR();
  }, [eventId, eventTitle, studentEmail, studentName]);

  const handleDownloadTicket = () => {
    // Standard download of QR as PNG
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Tiket-${eventTitle.replace(/\s+/g, "-")}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="flex flex-col md:flex-row bg-indigo-950 text-white border border-indigo-900 rounded-2xl overflow-hidden shadow-lg max-w-xl mx-auto" id={`ticket_${ticketNumber}`}>
      {/* Main Stub */}
      <div className="p-6 flex-1 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-indigo-800/60 border-dashed">
        {/* Ticket Circle Cutouts */}
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full hidden md:block" />
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full hidden md:block" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full hidden md:block" />
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-white rounded-full hidden md:block" />

        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 bg-indigo-900/50 px-2 py-0.5 rounded-md">
            E-TICKET RESMI
          </span>
          <h4 className="text-base font-bold text-stone-100 mt-2 line-clamp-1">
            {eventTitle}
          </h4>
          <p className="text-[10px] text-indigo-300 mt-0.5 font-mono">{ticketNumber}</p>
        </div>

        <div className="space-y-2 my-4">
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span>{eventDate}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span className="line-clamp-1">{eventLocation}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-100 font-semibold pt-1 border-t border-indigo-900">
            <User className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
            <span className="line-clamp-1">{studentName} ({studentEmail})</span>
          </div>
        </div>

        <p className="text-[10px] text-indigo-400">
          * Harap tunjukkan QR Code pada gawai Anda kepada pantia di pintu masuk.
        </p>
      </div>

      {/* QR Stub */}
      <div className="p-6 bg-white flex flex-col items-center justify-center min-w-[180px] shrink-0 text-indigo-950 text-center relative select-none">
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-stone-50 flex items-center justify-center">
              <QrCode className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
          )}
          <canvas ref={canvasRef} className="mx-auto" />
        </div>
        <p className="text-[10px] font-semibold tracking-wider text-indigo-900 mt-2 uppercase font-mono">
          SCAN UNTUK ABSENSI
        </p>
        <button
          onClick={handleDownloadTicket}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-semibold transition-colors"
          id={`download_qr_btn_${ticketNumber}`}
        >
          <Download className="w-3.5 h-3.5" />
          Unduh QR
        </button>
      </div>
    </div>
  );
}
