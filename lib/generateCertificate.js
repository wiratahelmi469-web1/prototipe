// SECTION: jsPDF Digital Certificate Compiler File
import { jsPDF } from "jspdf";

export function generateCertificate(event, user, serialCode) {
  // A4 Landscape Format dimensions (297mm x 210mm)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Create elegant Double Border around certificate margin
  // Outer Border (Royal Blue - #1a56db)
  doc.setDrawColor(26, 86, 219);
  doc.setLineWidth(1.5);
  doc.rect(8, 8, width - 16, height - 16);

  // Inner Border (Gold Accent - #f59e0b)
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.4);
  doc.rect(10.5, 10.5, width - 21, height - 21);

  // Decorative corners (little gold blocks)
  doc.setFillColor(245, 158, 11);
  doc.rect(8, 8, 5, 5, "F");
  doc.rect(width - 13, 8, 5, 5, "F");
  doc.rect(8, height - 13, 5, 5, "F");
  doc.rect(width - 13, height - 13, 5, 5, "F");

  // Top Title Card Logo
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(26, 86, 219);
  doc.text("EVENTHUB KAMPUS UNIVERSITAS NURUL FIKRI", width / 2, 22, { align: "center" });

  // Main Category Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("SERTIFIKAT PENGHARGAAN", width / 2, 42, { align: "center" });

  // Serial Number line
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  const finalCode = serialCode || `NF-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
  doc.text(`Nomor Sertifikat: ${finalCode}`, width / 2, 49, { align: "center" });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(width / 2 - 30, 53, width / 2 + 30, 53);

  // Recipient label
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("Diberikan kepada mahasiswa aktif:", width / 2, 65, { align: "center" });

  // Student Name (Highlight display)
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(26, 86, 219); // Blue
  const nameToDraw = user?.namaLengkap || user?.nama || "Budi Santoso";
  doc.text(nameToDraw.toUpperCase(), width / 2, 80, { align: "center" });

  // NIM / NIP descriptor
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`NIM/NIP: ${user?.nimNip || "2021001"}`, width / 2, 87, { align: "center" });

  // Line Spacer
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - 50, 93, width / 2 + 50, 93);

  // Participation Description paragraph
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text("Atas keikutsertaan aktifnya sebagai Peserta Terverifikasi dalam kegiatan:", width / 2, 104, { align: "center" });

  // Event Name TITLE in center block
  doc.setFont("Helvetica", "bolditalic");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Black slate
  const splitEventTitle = doc.splitTextToSize(event?.nama || "Seminar Kepanitiaan Kampus", width - 80);
  doc.text(splitEventTitle, width / 2, 116, { align: "center" });

  // Event specifics details details
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Kategori: ${event?.kategori || "Seminar Nasional"} • Diselenggarakan tanggal ${event?.tanggal || "01 Juni 2026"} • Ruang ${event?.lokasi || "Auditorium"}`, width / 2, 132, { align: "center" });

  // Divider lines
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.line(40, 145, width - 40, 145);

  // Bottom Left line: Organizers
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Hormat Kami,", 50, 158);
  doc.setFont("Helvetica", "bold");
  doc.text(event?.penyelenggara || "Kepanitiaan Mahasiswa", 50, 164);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Divisi Acara Penyelenggara", 50, 169);

  // Bottom Right line: Official Signature representation PO
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Project Officer (PO),", width - 95, 158);
  
  // Calligraphic signature representation (drawn mockup)
  doc.setDrawColor(26, 86, 219);
  doc.setLineWidth(0.5);
  doc.line(width - 95, 172, width - 42, 172);

  doc.setFont("Helvetica", "bold");
  doc.setTextColor(26, 86, 219);
  doc.text("Muhammad Jafar, M.T.", width - 95, 178);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Kemahasiswaan Universitas Nurul Fikri", width - 95, 183);

  // Save/Download PDF triggers
  const slug = (event?.nama || "sertifikat").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`Sertifikat_${slug}_${user?.nimNip || "temp"}.pdf`);
}
