// SECTION: Public Event Detail Page View
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  CheckCircle, 
  Share2, 
  Trash2, 
  Award, 
  GraduationCap 
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import Modal from "@/components/Modal";
import TicketQRCode from "@/components/TicketQRCode";
import { WARNA_KATEGORI } from "@/lib/constants";

export default function EventDetailPage({ params }) {
  // Safe React 19 parameter unwrap
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.id;

  const router = useRouter();
  const { user } = useAuth();
  const { events, rsvpEvent, cancelRsvp } = useEvents();
  const { showToast } = useToast();

  const evtEntity = events ? events.find((e) => e.id === eventId) : null;
  const loading = !events;

  // Modal toggle states
  const [confirmRsvpOpen, setConfirmRsvpOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Memuat rincian event...</span>
      </div>
    );
  }

  if (!evtEntity) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-sans gap-5 p-4 text-center">
        <div className="bg-red-50 p-4 border border-red-100 text-red-500 rounded-full">
          <GraduationCap className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Event Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">Event yang Anda cari mungkin sudah diarsipkan oleh Panitia atau tautan salah.</p>
        </div>
        <button
          onClick={() => router.push("/events")}
          className="bg-blue-600 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer hover:bg-blue-700 transition-all"
        >
          Koleksi Event &rarr;
        </button>
      </div>
    );
  }

  const isSudahRsvp = user && evtEntity.peserta?.some((p) => p.email.toLowerCase() === user.email.toLowerCase());
  const headerGradient = WARNA_KATEGORI[evtEntity.kategori] || "from-slate-500 to-slate-700";

  // Quota indicators
  const kuotaMax = evtEntity.kuotaMax || 100;
  const kuotaTerisi = evtEntity.kuotaTerisi || 0;
  const persentase = Math.min(100, Math.round((kuotaTerisi / kuotaMax) * 100));
  const isPenuh = persentase >= 100;

  // Clipboard copy
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Tautan event disalin ke papan klip! 🔗", "success");
    }
  };

  const handleRsvpClick = () => {
    if (!user || user.role === "guest") {
      showToast("Silakan login dengan akun Anda terlebih dahulu.", "warning");
      router.push("/login");
      return;
    }
    setConfirmRsvpOpen(true);
  };

  const handleRsvpConfirmSubmit = () => {
    const res = rsvpEvent(evtEntity.id, user);
    setConfirmRsvpOpen(false);
    if (res.success) {
      showToast("Pendaftaran berhasil! Sampai jumpa di event 🎉", "success");
    } else {
      showToast(res.error, "error");
    }
  };

  const handleCancelClick = () => {
    setConfirmCancelOpen(true);
  };

  const handleCancelConfirmSubmit = () => {
    const res = cancelRsvp(evtEntity.id, user.email);
    setConfirmCancelOpen(false);
    if (res.success) {
      showToast("Pendaftaran RSVP Anda dibatalkan.", "info");
    } else {
      showToast(res.error, "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col justify-between" id="event-detail-root-container">
      
      {/* Top Header bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-xs">
        <button 
          onClick={() => router.push("/events")} 
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors uppercase select-none cursor-pointer p-2 hover:bg-slate-50 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          Katalog
        </button>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => router.push(`/dashboard/${user.role}`)}
              className="bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Masuk
            </button>
          )}
        </div>
      </nav>

      <div className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* RESPONSIVE DUAL COLUMN BLOCK */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* COLUMN LEFT: MAIN DETAILS PORT (60%) */}
          <div className="w-full lg:w-3/5 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            {/* LARGE HEADER BANNER */}
            <div className={`h-48 md:h-56 bg-gradient-to-r ${headerGradient} p-6 md:p-8 flex flex-col justify-end relative select-none`}>
              <span className="absolute top-6 left-6 md:left-8 bg-white/95 text-slate-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-xs">
                {evtEntity.kategori}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-sm tracking-tight leading-tight max-w-xl">
                {evtEntity.nama}
              </h2>
            </div>

            {/* DETAIL DETAILS PANELS */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* INFORMATION GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tanggal */}
                <div className="flex items-start gap-3.5">
                  <div className="bg-blue-50/80 p-2.5 rounded-xl text-blue-600 border border-blue-100 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Waktu Acara</span>
                    <p className="text-xs font-bold text-slate-800 leading-normal mt-0.5">{evtEntity.tanggal}</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">{evtEntity.jam}</p>
                  </div>
                </div>

                {/* Lokasi */}
                <div className="flex items-start gap-3.5">
                  <div className="bg-blue-50/80 p-2.5 rounded-xl text-blue-600 border border-blue-100 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tempat</span>
                    <p className="text-xs font-bold text-slate-800 leading-normal mt-0.5 truncate max-w-[200px]" title={evtEntity.lokasi}>
                      {evtEntity.lokasi}
                    </p>
                  </div>
                </div>

                {/* Penyelenggara */}
                <div className="flex items-start gap-3.5">
                  <div className="bg-slate-50 p-2.5 border border-slate-150 text-slate-500 rounded-xl shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Penyelenggara</span>
                    <p className="text-xs font-bold text-slate-700 leading-normal mt-0.5 truncate max-w-[240px]">{evtEntity.penyelenggara}</p>
                  </div>
                </div>

                {/* Kategori */}
                <div className="flex items-start gap-3.5">
                  <div className="bg-slate-50 p-2.5 border border-slate-150 text-slate-500 rounded-xl shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tema Seminar</span>
                    <p className="text-xs font-extrabold text-slate-700 leading-normal mt-0.5">{evtEntity.kategori}</p>
                  </div>
                </div>
              </div>

              {/* KUOTA PROGRESS DETAIL */}
              <div className="pt-4 border-t border-slate-150">
                <div className="flex flex-col gap-1.5 mb-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold uppercase tracking-wide">Kursi Pendaftaran</span>
                    <span className={`font-black ${isPenuh ? "text-[#ef4444]" : "text-[#1a56db]"}`}>
                      {kuotaTerisi} Dari {kuotaMax} Terisi ({persentase}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-150 h-2.5 border border-slate-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isPenuh ? "bg-red-500" : "bg-blue-600"}`}
                      style={{ width: `${persentase}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* DESKRIPSI EVENT */}
              <div className="pt-5 border-t border-slate-150 space-y-2">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight uppercase">Deskripsi Kegiatan</h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                  {evtEntity.deskripsi || "Tidak ada deskripsi rinci yang tersedia untuk agenda event ini."}
                </p>
              </div>

              {/* SHARE LINKS AND BACK BUTTONS */}
              <div className="pt-6 border-t border-slate-150 flex flex-wrap gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 border border-slate-250 hover:bg-slate-50 hover:border-slate-300 text-slate-650 font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  Bagikan Tautan
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN RIGHT: STICKY CTA REGISTER CARD (40%) */}
          <div className="w-full lg:w-2/5 lg:sticky lg:top-24 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            
            {/* GUEST MODE VIEW SCENARIO */}
            {!user || user.role === "guest" ? (
              <div className="space-y-4 text-center p-3 select-none">
                <p className="font-extrabold text-sm text-slate-800">Pendaftaran Terbuka</p>
                <button
                  onClick={() => {
                    showToast("Harap masuk menggunakan akun kemahasiswaan.", "info");
                    router.push("/login");
                  }}
                  className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold text-sm py-4 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-blue-500/15 text-center"
                >
                  Masuk Untuk RSVP
                </button>
                <span className="text-[11px] text-slate-500 font-semibold block leading-normal">
                  * Akses pendaftaran dibatasi secara khusus hanya bagi civitas akademika STT Terpadu Nurul Fikri.
                </span>
              </div>
            ) : isSudahRsvp ? (
              
              /* USER IS REGISTERED AND LOGGED IN */
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-emerald-950">✓ Anda Sudah Terdaftar</p>
                    <p className="text-[10px] text-emerald-600 font-medium leading-normal mt-0.5">
                      Silakan tunjukkan QR Tiket masuk mandiri Anda kepada Panitia di loket registrasi saat mendatangi lokasi.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="w-full bg-slate-900 hover:bg-black text-white font-extrabold text-xs py-4 rounded-xl cursor-pointer transition-all shadow-sm text-center font-mono leading-none"
                    id="btn-trigger-ticket-qr"
                  >
                    LIHAT QR TIKET SAYA
                  </button>

                  <button
                    onClick={handleCancelClick}
                    className="w-full border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-600 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    id="btn-trigger-cancel-rsvp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Batalkan RSVP
                  </button>
                </div>
              </div>
            ) : evtEntity.eventStatus?.toLowerCase() === "tutup" || evtEntity.eventStatus?.toLowerCase() === "selesai" || isPenuh ? (
              
              /* OUT-OF-DATE / COMPLETED GATED SLOTS */
              <div className="space-y-4 select-none text-center p-3">
                <span className="bg-red-50 border border-red-150 inline-block text-[11px] uppercase tracking-wider text-red-650 font-black px-3.5 py-1.5 rounded-lg">
                  PENDAFTARAN DITUTUP
                </span>
                
                {/* CERTIFICATE SPECIAL DISPATCH STATUS BAR */}
                {evtEntity.eventStatus?.toLowerCase() === "selesai" && evtEntity.sertifikatStatus === "approved" ? (
                  <div className="bg-blue-50 border border-blue-150 text-blue-900 rounded-2xl p-4 text-left space-y-3 mt-4">
                    <div className="flex gap-2 text-blue-950">
                      <Award className="w-5 h-5 shrink-0 text-blue-600" />
                      <p className="font-extrabold text-xs truncate">Sertifikat sudah terbit!</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed leading-normal">
                      Selamat, sertifikat resmi kegiatan ini sudah disetujui PO. Silakan periksa di riwayat Anda untuk unduh PDF lengkap.
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/mahasiswa/riwayat")}
                      className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg tracking-tight transition-colors cursor-pointer block mt-1"
                    >
                      KE RIWAYAT SAYA &rarr;
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2 block">
                    Agenda ini telah berakhir atau kuota pendaftaran sudah penuh. Silakan cari agenda diskusi menarik lainnya di Beranda.
                  </p>
                )}

                <button
                  disabled
                  className="w-full bg-slate-100 text-slate-450 border border-slate-200 text-xs font-bold py-4 rounded-xl cursor-not-allowed text-center block"
                >
                  Formulir Ditutup
                </button>
              </div>
            ) : (
              
              /* ACTIVE FORM AND GUEST REGISTER SLOTS DETAILED SCENARIOS */
              <div className="space-y-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Investasi Investasi</p>
                  <p className="text-xl font-extrabold text-[#1a56db] mt-0.5 tracking-tight mb-2">GRATIS</p>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed leading-normal">
                    * Bersertifikat penuh setelah kegiatan sukses dilaksanakan. Dosen pembimbing / PO akan validasi presensi keikutseraan Anda.
                  </p>
                </div>

                <button
                  onClick={handleRsvpClick}
                  className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold text-sm py-4 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-blue-500/15 text-center leading-none"
                  id="btn-trigger-rsvp"
                >
                  RSVP Sekarang &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center text-slate-400 border-t border-slate-200 py-6 bg-white text-xs select-none">
        Portal EventHub Kampus &copy; STT Terpadu Nurul Fikri 2026. Semua hak dilindungi.
      </footer>

      {/* MODAL 1: RSVP CONFIRMED PUSH */}
      <Modal
        isOpen={confirmRsvpOpen}
        onClose={() => setConfirmRsvpOpen(false)}
        title="Konfirmasi Pendaftaran"
      >
        <div className="space-y-4 text-slate-700 font-sans text-xs">
          <p className="leading-relaxed">Apakah Anda yakin ingin mendaftarkan keikutsertaan Anda dalam event: <strong className="text-slate-900">{evtEntity.nama}</strong>?</p>
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={() => setConfirmRsvpOpen(false)}
              className="py-3 px-4 font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRsvpConfirmSubmit}
              className="py-3 px-4 font-bold bg-[#1a56db] hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-all hover:scale-102 shadow-sm"
              id="confirm-rsvp-yes-submit"
            >
              Ya, RSVP &rarr;
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: CANCEL CONFIRMED PROMPT */}
      <Modal
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        title="Batalkan RSVP Pendaftaran"
      >
        <div className="space-y-4 text-slate-700 font-sans text-xs">
          <p className="leading-relaxed">Apakah Anda bersumpah ingin membatalkan status keanggotaan Anda di kepanitiaan/peserta event <strong className="text-slate-900">{evtEntity.nama}</strong>?</p>
          <p className="text-red-500 font-bold">* Kuota ini akan dilepaskan secara permanen, sehingga posisi antrean Anda dipindahkan kepada calon peserta lain.</p>
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={() => setConfirmCancelOpen(false)}
              className="py-3 px-4 font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer transition-colors"
            >
              Kembali
            </button>
            <button
              onClick={handleCancelConfirmSubmit}
              className="py-3 px-4 font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition-all hover:scale-102"
              id="confirm-cancel-yes-submit"
            >
              Ya, Batalkan RSVP
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: QR TICKET WINDOW LAYOUT */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="QR TIket Keanggotaan Masuk"
      >
        <div className="flex flex-col items-center py-2 max-w-sm mx-auto">
          <TicketQRCode
            eventId={evtEntity.id}
            eventNama={evtEntity.nama}
            eventTanggal={evtEntity.tanggal}
            eventLokasi={evtEntity.lokasi}
          />
        </div>
      </Modal>
    </div>
  );
}
