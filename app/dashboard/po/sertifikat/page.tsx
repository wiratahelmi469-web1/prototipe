"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { INITIAL_CERTIFICATES, UserCertificate } from "../../../../lib/certificateData";
import { Award, CheckCircle2, ShieldCheck, FileCheck2, HelpCircle } from "lucide-react";
import { formatDate } from "../../../../lib/utils";
import Toast, { ToastContainer } from "../../../../components/Toast";

export default function POAuditCertificates() {
  const { user } = useAuth();
  const router = useRouter();

  const [certs, setCerts] = useState<UserCertificate[]>([]);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (!user || user.role !== "po") {
      router.push("/login");
      return;
    }

    const savedCerts = localStorage.getItem("eventhub_certs");
    if (savedCerts) {
      try { setCerts(JSON.parse(savedCerts)); } catch (e) { setCerts(INITIAL_CERTIFICATES); }
    } else {
      setCerts(INITIAL_CERTIFICATES);
    }
  }, [user, router]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleApprovePO = (certId: string, student: string) => {
    const updated = certs.map((c) => {
      if (c.id === certId) {
        return { ...c, isApprovedByPO: true, isDistributed: true };
      }
      return c;
    });

    localStorage.setItem("eventhub_certs", JSON.stringify(updated));
    setCerts(updated);
    addToast(`E-Sertifikat untuk '${student}' resmi disahkan & dikirim!`, "success");
  };

  const pendingCerts = certs.filter((c) => !c.isApprovedByPO);

  return (
    <Workspace id="po_audit_certificates_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6" id="po_sertifikat_viewport">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Validasi e-Sertifikat Digital</h2>
          <p className="text-xs text-stone-500 mt-1">Audit keabsahan data kemahasiswaan and berikan tanda tangan pengesahan digital Anda.</p>
        </div>

        {/* List of unapproved certs */}
        {pendingCerts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-stone-200 rounded-2xl shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-pulse" />
            <h4 className="text-sm font-bold text-stone-700">Audit e-Sertifikat Bersih</h4>
            <p className="text-xs text-stone-400 mt-0.5">Semua e-Sertifikat mahasiswa telah disahkan sepenuhnya.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCerts.map((c) => (
              <div key={c.id} className="bg-white border border-stone-220/80 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id={`audit_cert_row_${c.id}`}>
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded">
                    PERLU VERIFIKASI PO
                  </span>
                  <h4 className="text-xs font-black text-stone-900 mt-1">{c.userName}</h4>
                  <p className="text-[10px] text-stone-400 font-mono">
                    Peran: <strong className="text-stone-600">{c.role}</strong> • Email: {c.userEmail}
                  </p>
                  <p className="text-xs text-stone-500 font-bold mt-1 max-w-md line-clamp-1">
                    Event: {c.eventTitle}
                  </p>
                </div>

                <button
                  onClick={() => handleApprovePO(c.id, c.userName)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs shrink-0"
                  id={`verify_cert_btn_${c.id}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sahkan &amp; Kirim
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Workspace>
  );
}
