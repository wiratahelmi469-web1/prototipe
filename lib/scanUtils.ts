export interface ScannedTicketResult {
  isValid: boolean;
  message: string;
  studentName?: string;
  studentEmail?: string;
  eventId?: string;
  eventTitle?: string;
  scannedAt?: string;
}

export function parseAndValidateQR(qrText: string, currentEventId?: string): ScannedTicketResult {
  try {
    // Expected format: EH-TICKET: { "id": "...", "email": "...", "eventId": "..." }
    if (!qrText.startsWith("EH-TICKET:")) {
      return {
        isValid: false,
        message: "Format QR Code tidak dikenali sebagai Tiket Valid EventHub Kampus."
      };
    }

    const jsonStr = qrText.replace("EH-TICKET:", "").trim();
    const data = JSON.parse(jsonStr);

    if (!data.id || !data.email || !data.eventId) {
      return {
        isValid: false,
        message: "Metabox data tiket tidak lengkap."
      };
    }

    // If a specific event is active in scanner, check if it matches
    if (currentEventId && data.eventId !== currentEventId) {
      return {
        isValid: false,
        message: `Tiket terdaftar untuk EventID Lainnya (${data.eventId}). Harap scan pada gerbang event yang sesuai.`
      };
    }

    return {
      isValid: true,
      message: "Tiket Terverifikasi! Kehadiran mahasiswa dicatat.",
      studentName: data.name || data.email.split("@")[0],
      studentEmail: data.email,
      eventId: data.eventId,
      eventTitle: data.eventTitle || "Event Terkait",
      scannedAt: new Date().toLocaleTimeString("id-ID")
    };
  } catch (err) {
    return {
      isValid: false,
      message: "Gagal membaca tanda tangan digital QR Code. Tiket rusak atau corrupt."
    };
  }
}

export function generateTicketQRPayload(eventId: string, eventTitle: string, email: string, name: string): string {
  const payload = {
    id: `tk-${Math.random().toString(36).substr(2, 9)}`,
    eventId,
    eventTitle,
    email,
    name
  };
  return `EH-TICKET:${JSON.stringify(payload)}`;
}
