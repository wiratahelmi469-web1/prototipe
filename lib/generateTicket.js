// SECTION: jsPDF Digital Ticket Generator File
import { jsPDF } from "jspdf";

export function generateTicket(event, user, qrCodeBase64) {
  // Setup standard A6 card format (105mm x 148mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a6"
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Draw Header Background (Royal Blue - #1a56db)
  doc.setFillColor(26, 86, 219);
  doc.rect(0, 0, width, 36, "F");

  // Title: EventHub Kampus
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("EventHub Kampus", 8, 12);

  // Subtitle: Universitas Nurul Fikri
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(245, 158, 11); // Amber accent
  doc.text("UNIVERSITAS NURUL FIKRI", 8, 18);

  // Ticket badge
  doc.setFillColor(245, 158, 11);
  doc.rect(width - 28, 8, 22, 6, "F");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("ENTRY PASS", width - 25, 12);

  // Horizontal divider
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(8, 24, width - 8, 24);

  // Date and location line
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 255);
  doc.text(`Tgl Acara: ${event.tanggal || "-"}`, 8, 30);

  // White center body area
  doc.setFillColor(255, 255, 255);
  
  // Card outer shadow border lines
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.rect(6, 42, width - 12, 98);

  // Event Name
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // Slate-800
  const splitTitle = doc.splitTextToSize(event.nama || "Seminar Kepanitiaan", width - 20);
  doc.text(splitTitle, 10, 50);

  // Location Indicator
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Tempat: ${event.lokasi || "-"}`, 10, 60);

  // Line Spacer
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  doc.line(10, 64, width - 10, 64);

  // Student details labels and values
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text("STUDENT PARTICIPANT", 10, 71);

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(user?.nama || "Tamu", 10, 77);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`NIM/NIP: ${user?.nimNip || "GUEST"}`, 10, 83);
  doc.text(`Email: ${user?.email || "-"}`, 10, 87);

  // Draw Ticket QR image
  if (qrCodeBase64) {
    // Center it on remaining vertical card space
    const qrWidth = 42;
    const qrHeight = 42;
    const qrX = (width - qrWidth) / 2;
    const qrY = 94;

    doc.addImage(qrCodeBase64, "PNG", qrX, qrY, qrWidth, qrHeight);
  }

  // Footer security signature hash representation
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text("PENGGUNAAN RESMI • VERIFIKATOR PINDAI QR PRESENSI MANDIRI", width / 2, height - 7, { align: "center" });

  // Save/Download Triggers
  const slug = (event.nama || "tiket").toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`TiketEvent_${slug}.pdf`);
}
