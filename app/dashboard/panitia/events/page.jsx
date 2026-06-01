// SECTION: Panitia Kelola Event (Divisi Acara) Console
"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  FolderHeart, 
  Calendar, 
  MapPin, 
  Users, 
  X, 
  Save, 
  Clock, 
  Trash2,
  FolderLock
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";
import EmptyState from "@/components/EmptyState";
import { KATEGORI_EVENT } from "@/lib/constants";

export default function PanitiaEventsConsole() {
  const { user } = useAuth();
  const { events, addEvent, deleteEvent, updateEventStatus } = useEvents();
  const { showToast } = useToast();

  const myEvents = (user && events) ? events.filter(
    (e) => e.pengajuEmail?.toLowerCase() === user.email?.toLowerCase()
  ) : [];

  const [formOpen, setFormOpen] = useState(false);
  const [deleteConfirmEvt, setDeleteConfirmEvt] = useState(null);

  // Proposal Form States
  const [evtNama, setEvtNama] = useState("");
  const [evtKategori, setEvtKategori] = useState("");
  const [evtTanggal, setEvtTanggal] = useState("");
  const [evtJam, setEvtJam] = useState("");
  const [evtLokasi, setEvtLokasi] = useState("");
  const [evtKuota, setEvtKuota] = useState(100);
  const [evtDeskripsi, setEvtDeskripsi] = useState("");

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    if (!evtNama.trim()) {
      showToast("Nama event wajib diisi.", "error");
      return;
    }
    if (!evtKategori) {
      showToast("Pilih kategori event.", "error");
      return;
    }
    if (!evtTanggal || !evtJam) {
      showToast("Tanggal & jam wajib dilengkapi.", "error");
      return;
    }
    if (!evtLokasi.trim()) {
      showToast("Lokasi wajib diisi.", "error");
      return;
    }

    const payload = {
      nama: evtNama,
      kategori: evtKategori,
      tanggal: evtTanggal,
      jam: evtJam,
      lokasi: evtLokasi,
      kuotaMax: Number(evtKuota),
      deskripsi: evtDeskripsi,
      pengajuLabel: user.nama,
      pengajuEmail: user.email,
    };

    const res = addEvent(payload);
    if (res.success) {
      showToast("Usulan event sukses diajukan ke Project Officer! 🚀", "success");
      setFormOpen(false);
      // Clean inputs
      setEvtNama("");
      setEvtKategori("");
      setEvtTanggal("");
      setEvtJam("");
      setEvtLokasi("");
      setEvtKuota(100);
      setEvtDeskripsi("");
    } else {
      showToast(res.error, "error");
    }
  };

  const handleUpdateStatus = (evtId, nextStatus) => {
    const res = updateEventStatus(evtId, nextStatus);
    if (res.success) {
      showToast(`Status event berhasil diubah menjadi: ${nextStatus.toUpperCase()} 🎉`, "success");
      if (nextStatus === "selesai") {
        showToast("Rilis sertifikat didorong ke antrean PO untuk ttd.", "info");
      }
    } else {
      showToast(res.error, "error");
    }
  };

  const handleDeleteSubmit = () => {
    if (!deleteConfirmEvt) return;
    const res = deleteEvent(deleteConfirmEvt.id);
    setDeleteConfirmEvt(null);

    if (res.success) {
      showToast("Proposal event berhasil dihapus secara permanen.", "info");
    } else {
      showToast(res.error, "error");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["panitia"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="panitia-events-console-root">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Daftar Usulan Event Anda
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
              Buat usulan kegiatan baru, pantau status persetujuan PO, dan kelola status aktif pendaftaran peserta.
            </p>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#1a56db] hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-5 rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
            id="btn-trigger-propose"
          >
            <Plus className="w-4 h-4" />
            Ajukan Usulan Baru
          </button>
        </div>

        {/* LIST CONSOLE */}
        {myEvents.length === 0 ? (
          <EmptyState
            judul="Belum Ada Usulan"
            deskripsi="Anda belum mengajukan gagasan seminar, workshop, atau kompetisi apa pun."
            ikon={FolderHeart}
            tombolLabel="Ajukan Gagasan Pertama"
            onTombolClick={() => setFormOpen(true)}
          />
        ) : (
          <div className="space-y-4" id="panitia-managed-event-list">
            {myEvents.map((evt) => {
              // Styling status
              const statusColors = {
                approved: "bg-emerald-50 text-emerald-700 border-emerald-150",
                pending_approval: "bg-amber-50 text-amber-700 border-amber-150",
                rejected: "bg-red-50 text-red-700 border-red-150",
              };

              return (
                <div 
                  key={evt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Left Metadata columns */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md border text-[9px] font-mono leading-none">{evt.kategori}</span>
                      <span className={`text-[10px] border font-black px-2.5 py-0.5 rounded-md uppercase tracking-wide leading-none ${statusColors[evt.status]}`}>
                        ADMIN: {evt.status === "approved" ? "TERVERIFIKASI" : evt.status === "pending_approval" ? "MENUNGGU PO" : "DITOLAK"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight max-w-xl">
                      {evt.nama}
                    </h3>

                    {/* Metadata summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 text-[11px] font-semibold text-slate-500 gap-2 pt-1 border-t border-slate-50">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {evt.tanggal} &bull; {evt.jam}</span>
                      <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {evt.lokasi}</span>
                      <span className="flex items-center gap-1 font-bold text-slate-700"><Users className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {evt.kuotaTerisi}/{evt.kuotaMax} Terdaftar</span>
                    </div>
                  </div>

                  {/* Right Actions columns */}
                  <div className="flex border-t border-slate-100 pt-4 lg:pt-0 lg:border-0 items-center flex-wrap gap-2.5 shrink-0 w-full lg:w-auto">
                    {/* Lifecycle status toggles – Only for approved events */}
                    {evt.status === "approved" ? (
                      <div className="flex-1 lg:flex-initial flex flex-col gap-1 w-full sm:w-auto">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Ubah Status Event:</span>
                        <select
                          value={evt.eventStatus || "segera"}
                          onChange={(e) => handleUpdateStatus(evt.id, e.target.value)}
                          className="w-full sm:w-44 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#1a56db] focus:bg-white text-slate-800 text-xs py-2 px-2.5 rounded-xl outline-none cursor-pointer font-bold"
                          id={`select-status-${evt.id}`}
                        >
                          <option value="segera">Segera Aktif</option>
                          <option value="buka">Buka Registrasi (RSVP)</option>
                          <option value="tutup">Tutup Registrasi</option>
                          <option value="selesai">Selesai (Klaim Sertifikat)</option>
                        </select>
                      </div>
                    ) : (
                      /* Display warning description of PO rejects */
                      evt.status === "rejected" && (
                        <p className="text-[10px] text-red-500 italic font-semibold max-w-[200px] leading-relaxed">
                          * Ajuan ditolak oleh PO. Silakan ajukan gagasan revisi baru.
                        </p>
                      )
                    )}

                    {/* Trash/Delete Proposal */}
                    <button
                      onClick={() => setDeleteConfirmEvt(evt)}
                      className="p-3 bg-red-50 border border-red-100/10 hover:bg-red-100 text-[#ef4444] rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Batalkan/Hapus Usulan"
                      id={`btn-delete-${evt.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL 1: ADD USULAN PROPOSAL FORM */}
        <Modal 
          isOpen={formOpen} 
          onClose={() => setFormOpen(false)} 
          title="Ajukan Usulan Event Baru"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 font-sans text-xs">
            
            {/* Nama Event */}
            <div className="space-y-1">
              <label htmlFor="form-evt-nama" className="font-bold text-slate-700 block">Nama / Judul Kegiatan</label>
              <input
                id="form-evt-nama"
                type="text"
                required
                placeholder="Contoh: Seminar Nasional AI & Masa Depan Programmer"
                value={evtNama}
                onChange={(e) => setEvtNama(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 py-3 px-4 rounded-xl text-slate-800"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1">
              <label htmlFor="form-evt-cat" className="font-bold text-slate-700 block">Kategori Kegiatan</label>
              <select
                id="form-evt-cat"
                required
                value={evtKategori}
                onChange={(e) => setEvtKategori(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 py-3 px-3.5 rounded-xl text-slate-800 cursor-pointer"
              >
                <option value="">Pilih Kategori...</option>
                {KATEGORI_EVENT.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tanggal & Jam */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label htmlFor="form-evt-tgl" className="font-bold text-slate-700 block">Tanggal Acara</label>
                <input
                  id="form-evt-tgl"
                  type="date"
                  required
                  value={evtTanggal}
                  onChange={(e) => setEvtTanggal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white py-2.5 px-4 rounded-xl text-slate-800 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="form-evt-jam" className="font-bold text-slate-700 block">Jam Pelaksanaan</label>
                <input
                  id="form-evt-jam"
                  type="text"
                  required
                  placeholder="Contoh: 09:00 - 12:00 WIB"
                  value={evtJam}
                  onChange={(e) => setEvtJam(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white py-2.5 px-4 rounded-xl text-slate-800"
                />
              </div>
            </div>

            {/* Tempat & Kuota */}
            <div className="grid grid-cols-3 gap-3.5">
              <div className="col-span-2 space-y-1">
                <label htmlFor="form-evt-lok" className="font-bold text-slate-700 block">Lokasi / Ruangan</label>
                <input
                  id="form-evt-lok"
                  type="text"
                  required
                  placeholder="Contoh: Auditorium Utama lt.4"
                  value={evtLokasi}
                  onChange={(e) => setEvtLokasi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white py-2.5 px-4 rounded-xl text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="form-evt-kuota" className="font-bold text-slate-700 block">Kuota Maks</label>
                <input
                  id="form-evt-kuota"
                  type="number"
                  required
                  value={evtKuota}
                  onChange={(e) => setEvtKuota(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white py-2.5 px-4 rounded-xl text-slate-800"
                  min="1"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <label htmlFor="form-evt-desc" className="font-bold text-slate-700 block">Deskripsi Kegiatan</label>
              <textarea
                id="form-evt-desc"
                rows="3"
                placeholder="Tuliskan tujuan acara, pembicara, dan benefit bagi peserta seminar..."
                value={evtDeskripsi}
                onChange={(e) => setEvtDeskripsi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white py-2.5 px-4 rounded-xl text-slate-800 outline-none"
              />
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="py-3 px-4 font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-3 px-4 font-bold bg-[#1a56db] hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
                id="btn-submit-proposal"
              >
                <Save className="w-4 h-4" />
                Kirim Usulan &rarr;
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL 2: DELETION CONFIRMATION DIALOG */}
        <Modal
          isOpen={!!deleteConfirmEvt}
          onClose={() => setDeleteConfirmEvt(null)}
          title="Hapus Usulan Proposal"
        >
          {deleteConfirmEvt && (
            <div className="space-y-4 font-sans text-xs text-slate-700">
              <p className="leading-relaxed">Apakah Anda yakin bersedia menghapus secara permanen usulan event <strong className="text-slate-900">{deleteConfirmEvt.nama}</strong>?</p>
              <p className="text-red-500 font-bold">* Keputusan ini bersifat mutlak, semua data pendaftar (jika ada) akan terhapus tak tersisa.</p>
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmEvt(null)}
                  className="py-3 px-4 font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  className="py-3 px-4 font-bold bg-[#ef4444] hover:bg-red-700 text-white rounded-xl cursor-pointer transition-colors"
                  id="btn-confirm-delete-yes"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
