// SECTION: Dynamic QR Code Ticket Component with PDF Downloader
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useToast from "@/hooks/useToast";
import { generateTicket } from "@/lib/generateTicket";

export default function TicketQRCode({ eventId, eventNama, eventTanggal, eventLokasi }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const rawPayload = JSON.stringify({
    eventId: eventId,
    userEmail: user?.email || "guest@nurulfikri.ac.id",
    nama: user?.nama || "Tamu",
    nim: user?.nimNip || "GUEST"
  });

  useEffect(() => {
    // Generate base64 Data URL using qrcode package
    QRCode.toDataURL(
      rawPayload,
      {
        width: 250,
        margin: 2,
        color: {
          dark: "#1e293b", // Slate-800
          light: "#ffffff",
        },
      },
      (err, url) => {
        setLoading(false);
        if (err) {
          console.error("QR Code encoding failure:", err);
          return;
        }
        setQrUrl(url);
      }
    );
  }, [rawPayload]);

  const handleDownloadPdfTicket = () => {
    if (!qrUrl) {
      showToast("Gagal memproses QR Code.", "error");
      return;
    }

    try {
      const eventDetails = {
        nama: eventNama,
        tanggal: eventTanggal,
        lokasi: eventLokasi
      };

      generateTicket(eventDetails, user, qrUrl);
      showToast("Tiket masuk PDF berhasil diunduh! 🎟️", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal menerbitkan PDF Tiket.", "error");
    }
  };

  return (
    <div className="bg-white p-6 border rounded-2xl border-slate-200 shadow-xs flex flex-col items-center gap-4 text-center w-full select-none" id={`ticket-qr-box-${eventId}`}>
      
      {/* Header Info */}
      <div>
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#1a56db] bg-blue-50 py-0.5 px-2.5 rounded-md">TIKET PRESENSI</span>
        <h4 className="font-extrabold text-slate-900 text-xs mt-1.5 leading-tight truncate max-w-[240px]">{eventNama}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5">{eventTanggal}</p>
      </div>

      {/* QR CONTAINER BOUNDS */}
      <div className="relative w-44 h-44 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-2.5 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-[9px] text-slate-400 font-bold">Encoding...</span>
          </div>
        ) : (
          qrUrl && (
            <img 
              src={qrUrl} 
              alt="QR Code Tiket Masuk" 
              className="w-full h-full object-contain mix-blend-multiply animate-fade-in" 
              referrerPolicy="no-referrer"
            />
          )
        )}
      </div>

      {/* FOOTER METRICS INFO */}
      <div className="border-t border-slate-150 pt-3.5 w-full space-y-1">
        <p className="font-extrabold text-slate-800 text-[11px] leading-none uppercase">{user?.nama}</p>
        <p className="text-[10px] text-slate-500 font-mono font-bold leading-none">{user?.nimNip || "GUEST ACCOUNT"}</p>
      </div>

      {/* SUBMISSION BUTTON */}
      <button
        onClick={handleDownloadPdfTicket}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1a56db] hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-colors"
        id={`btn-download-pdf-ticket-${eventId}`}
      >
        <Download className="w-4 h-4 text-[#f59e0b]" />
        Download Tiket PDF
      </button>
    </div>
  );
}
