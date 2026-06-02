"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { CERTIFICATE_TEMPLATES, INITIAL_CERTIFICATES, UserCertificate, CertificateTemplate } from "../../../../lib/certificateData";
import { Award, Download, Sparkles, LayoutGrid, CheckCircle2, FileVideo, Eye, HelpCircle } from "lucide-react";
import { formatDate } from "../../../../lib/utils";
import Toast, { ToastContainer } from "../../../../components/Toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CertificateGeneratorPage() {
  const { user } = useAuth();
  const router = useRouter();

  const certificateRef = useRef<HTMLDivElement>(null);

  // States
  const [certs, setCerts] = useState<UserCertificate[]>([]);
  const [selectedCertId, setSelectedCertId] = useState("cert-01");
  const [selectedTemplateId, setSelectedTemplateId] = useState("tmpl-01");
  const [downloading, setDownloading] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (!user || user.role !== "panitia") {
      router.push("/login");
      return;
    }

    // Sync / Load certificates list
    const savedCerts = localStorage.getItem("eventhub_certs");
    if (savedCerts) {
      try { setCerts(JSON.parse(savedCerts)); } catch (e) { setCerts(INITIAL_CERTIFICATES); }
    } else {
      localStorage.setItem("eventhub_certs", JSON.stringify(INITIAL_CERTIFICATES));
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

  const selectedCert = certs.find((c) => c.id === selectedCertId) || certs[0];
  const selectedTemplate = CERTIFICATE_TEMPLATES.find((t) => t.id === selectedTemplateId) || CERTIFICATE_TEMPLATES[0];

  const handleApproveAndDistribute = (certId: string) => {
    const updated = certs.map((c) => {
      if (c.id === certId) {
        return { ...c, isApprovedByPO: true, isDistributed: true };
      }
      return c;
    });

    localStorage.setItem("eventhub_certs", JSON.stringify(updated));
    setCerts(updated);
    addToast("Status e-Sertifikat berhasil disetujui & didistribusikan ke inbox Mahasiswa!", "success");
  };

  // Convert HTML to Canva image and save to jspdf
  const handleExportPDF = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    addToast("Mengekspor e-Sertifikat resolusi tinggi...", "info");

    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Retain sharp details
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [800, 560]
      });

      pdf.addImage(imgData, "PNG", 0, 0, 800, 560);
      pdf.save(`Sertifikat_${selectedCert.userName.replace(/\s+/g, "_")}.pdf`);
      
      addToast("e-Sertifikat PDF sukses di-download!", "success");
    } catch (error) {
      console.error("Certificate download error: ", error);
      addToast("Terjadi gangguan saat memilah canvas PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (!user) return null;

  return (
    <Workspace id="panitia_sertifikat_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="space-y-6" id="sertifikat_viewport">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Distribusi E-Sertifikat Kampus</h2>
          <p className="text-xs text-stone-500 mt-1">
            Konfigurasi desain, setujui kehadiran, dan unduh sertifikat PDF resmi bercode validasi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor sidebar options */}
          <div className="space-y-6 lg:col-span-1">
            {/* Design templates selector */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2.5 flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                TEMPLATE DESAIN CETAK
              </h4>
              <div className="space-y-1.5">
                {CERTIFICATE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      selectedTemplateId === tmpl.id
                        ? "bg-indigo-600 border-indigo-700 text-white"
                        : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    <span>{tmpl.name}</span>
                    <span className="text-[10px] font-mono opacity-80">({tmpl.theme})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List of present student logs */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2.5">
                DAFTAR PENERIMA VALID
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {certs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCertId(c.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedCertId === c.id
                        ? "bg-stone-900 border-stone-900 text-white"
                        : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    <div>
                      <p className="font-bold line-clamp-1">{c.userName}</p>
                      <p className={`text-[10px] font-mono ${selectedCertId === c.id ? "text-stone-300" : "text-stone-400"}`}>
                        {c.role} • {c.userEmail.split("@")[0]}
                      </p>
                    </div>

                    {c.isDistributed ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Distributed" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-ping" title="Needs Approval" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Visual layout area */}
          {selectedCert && (
            <div className="lg:col-span-2 space-y-6">
              {/* Dynamic Live WYSIWYG Renderer */}
              <div
                ref={certificateRef}
                style={{ width: "800px", height: "560px" }}
                className={`border-[14px] ${selectedTemplate.borderColor} p-12 flex flex-col justify-between items-center text-center relative overflow-hidden bg-white shadow-xl rounded-lg select-none`}
                id="live_certificate_frame"
              >
                {/* Background watermarked badges */}
                <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
                
                {/* Certificate Core header */}
                <div className="z-10 w-full">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 font-mono">
                    UNIVERSITAS NURUL FIKRI • JAKARTA INDONESIA
                  </span>
                  <h2 className="text-3xl font-black text-stone-900 mt-2.5 tracking-tight font-serif">
                    SERTIFIKAT PENGHARGAAN
                  </h2>
                  <div className="w-40 h-[2px] bg-amber-600 mx-auto mt-2.5" />
                  <p className="text-[10px] text-stone-400 font-mono tracking-wider mt-1 uppercase">NO REG: {selectedCert.certificateNumber}</p>
                </div>

                {/* Subtitle */}
                <div className="z-10 space-y-2">
                  <p className="text-xs text-stone-400 font-medium italic">Sertifikat ini dianugerahkan dengan hormat kepada:</p>
                  <h3 className="text-2xl font-extrabold text-indigo-900 tracking-tight font-serif uppercase">
                    {selectedCert.userName}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-lg leading-relaxed mx-auto">
                    Atas kontribusi dan dedikasi luar biasa sebagai <strong className="text-indigo-700">{selectedCert.role}</strong> dalam menyukseskan program kerja kemahasiswaan:
                  </p>
                  <h4 className="text-sm font-bold text-stone-800 tracking-wide mt-1 underline">
                    {selectedCert.eventTitle}
                  </h4>
                </div>

                {/* Footnotes and Barcode signature */}
                <div className="z-10 w-full flex justify-between items-end px-6 border-t border-stone-100 pt-6">
                  {/* Left Signature */}
                  <div className="text-left space-y-1">
                    <p className="text-[9px] text-stone-400 uppercase font-mono">Tertandatangan Rektorat</p>
                    <p className="text-xs font-serif font-bold text-stone-850">Dr. Lukman Hakim, M.Kom</p>
                    <div className="w-24 h-[1px] bg-stone-300" />
                    <p className="text-[8px] text-stone-400 font-mono">Wakil Rektor Kemahasiswaan</p>
                  </div>

                  {/* QR barcode Validation stamp */}
                  <div className="flex flex-col items-center gap-1">
                    {/* Simulated barcode */}
                    <div className="w-12 h-12 bg-white border border-stone-200 p-1 rounded-sm">
                      <svg viewBox="0 0 24 24" className="w-full h-full text-stone-850">
                        {/* Barcode mock icon */}
                        <path fill="currentColor" d="M3 3h4v4H3zm14 0h4v4h-4zM3 17h4v4H3zm14 0h4v4h-4zM9 9h6v6H9z" />
                      </svg>
                    </div>
                    <span className="text-[7px] text-stone-400 uppercase font-mono tracking-widest">VALIDATED CERTID</span>
                  </div>
                </div>
              </div>

              {/* Action operations controls */}
              <div className="flex gap-3 justify-end items-center bg-stone-100 p-4 rounded-2xl border border-stone-200">
                <p className="text-[11px] text-stone-500 font-medium mr-auto">
                  Status: {selectedCert.isDistributed ? "Telah Didistribusikan" : "Menunggu Disetujui"}
                </p>

                {!selectedCert.isDistributed && (
                  <button
                    onClick={() => handleApproveAndDistribute(selectedCert.id)}
                    className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Setujui &amp; Kirim E-Sertifikat
                  </button>
                )}

                <button
                  disabled={downloading}
                  onClick={handleExportPDF}
                  className="py-2.5 px-5.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                  id="final_certificate_pdf_export_btn"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  {downloading ? "Formatting..." : "Download PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Workspace>
  );
}
