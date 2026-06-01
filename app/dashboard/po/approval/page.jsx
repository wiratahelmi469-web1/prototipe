// SECTION: Project Officer Event Proposal Approval Console
"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  HelpCircle, 
  Building, 
  Calendar, 
  MapPin, 
  Users,
  Eye,
  AlertCircle
} from "lucide-react";
import useEvents from "@/hooks/useEvents";
import useToast from "@/hooks/useToast";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";

export default function PoProposalApprovals() {
  const { events, updateEventApproval } = useEvents();
  const { showToast } = useToast();

  const pendingEvents = events ? events.filter((e) => e.status === "pending_approval") : [];
  const [selectedReviewEvt, setSelectedReviewEvt] = useState(null);
  
  // Rejection modal reason state
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [rejectReasonNotes, setRejectReasonNotes] = useState("");

  const handleApprove = (evtId) => {
    const res = updateEventApproval(evtId, "approved");
    setSelectedReviewEvt(null);

    if (res.success) {
      showToast("Proposal event disetujui untuk dipublikasikan! 🎉", "success");
    } else {
      showToast(res.error, "error");
    }
  };

  const handleRejectInitiate = (evtId) => {
    setRejectId(evtId);
    setRejectReasonNotes("");
    setRejectReasonOpen(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReasonNotes.trim()) {
      showToast("Harap berikan alasan penolakan proposal.", "error");
      return;
    }

    const res = updateEventApproval(rejectId, "rejected");
    setRejectReasonOpen(false);
    setSelectedReviewEvt(null);

    if (res.success) {
      showToast("Proposal sukses ditolak dengan catatan pengembalian.", "info");
    } else {
      showToast(res.error, "error");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["po"]}>
      <div className="space-y-6 font-sans select-none animate-fade-in" id="po-proposal-approvals-root">
        
        {/* HEADER */}
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Verifikasi Proposal Kegiatan
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-normal mt-1">
            Audit rincian kegiatan seminar/workshop dari para pengaju kepanitiaan, setujui penayangan publik, atau tolek jika berkas penunjang tidak lengkap.
          </p>
        </div>

        {/* PENDING LIST BOARD */}
        {pendingEvents.length === 0 ? (
          <EmptyState
            judul="Pekerjaan Beres!"
            deskripsi="Semua pengajuan usulan event kepanitiaan dari divisi acara mahasiswa saat ini sudah bersih terverifikasi."
            ikon={CheckCircle}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="po-pending-review-grid">
            {pendingEvents.map((evt) => (
              <div 
                key={evt.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[10px] bg-amber-500/10 text-amber-700 font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200 rounded-md">
                      Pending review
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">{evt.id}</span>
                  </div>

                  <h3 className="font-extrabold text-slate-950 text-sm md:text-base leading-snug">
                    {evt.nama}
                  </h3>

                  <div className="text-[11px] font-semibold text-slate-500 space-y-1.5 border-t border-slate-50 pt-2.5">
                    <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {evt.tanggal} &bull; {evt.jam}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {evt.lokasi}</p>
                    <p className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Pengaju: <strong className="text-slate-700 font-extrabold">{evt.penyelenggara}</strong></p>
                    <p className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Kuota: {evt.kuotaMax} Kursi</p>
                  </div>
                </div>

                {/* BOTTOM ACTIONS TRIGGERS */}
                <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-50 mt-4">
                  <button
                    onClick={() => handleRejectInitiate(evt.id)}
                    className="inline-flex py-3 font-bold text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors cursor-pointer items-center justify-center gap-1.5"
                    id={`btn-reject-${evt.id}`}
                  >
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    Tolak Event
                  </button>

                  <button
                    onClick={() => handleApprove(evt.id)}
                    className="inline-flex py-3 font-extrabold text-xs bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl transition-all hover:scale-[1.01] cursor-pointer items-center justify-center gap-1.5"
                    id={`btn-approve-${evt.id}`}
                  >
                    <CheckCircle className="w-4 h-4 text-white shrink-0" />
                    Setujui & Publikasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: INPUT PENJELASAN ALASAN PENOLAKAN */}
        <Modal
          isOpen={rejectReasonOpen}
          onClose={() => setRejectReasonOpen(false)}
          title="Berikan Catatan Penolakan"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4 font-sans text-xs">
            <div className="p-3 bg-red-50 text-red-805 rounded-xl border border-red-100 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="font-semibold leading-relaxed">Proposal akan dikembalikan ke dashboard Panitia untuk revisi lanjutan. Berikan poin-poin masukan perbaikan di bawah.</p>
            </div>

            <textarea
              required
              rows="3"
              placeholder="Catatan penolakan: misal, 'Kuoto kuota melebihi kapasitas auditorium 50 kursi, tolong sesuaikan...' atau 'Sertakan nama pembawa materi...'"
              value={rejectReasonNotes}
              onChange={(e) => setRejectReasonNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-250 focus:border-[#1a56db] focus:bg-white p-3 rounded-xl text-slate-800 outline-none font-medium"
            />

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectReasonOpen(false)}
                className="py-3 px-4 font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-3 px-4 font-bold bg-[#ef4444] hover:bg-red-700 text-white rounded-xl cursor-pointer"
                id="btn-confirm-reject-reject-submit"
              >
                Kirim Penolakan
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
