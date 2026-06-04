import { EventItem, NotificationItem, INITIAL_EVENTS, INITIAL_NOTIFICATIONS } from "./mockData";

export interface BudgetItem {
  id: string;
  eventId: string;
  itemName: string;
  category: "konsumsi" | "perlengkapan" | "transportasi" | "akomodasi" | "dokumentasi" | "lainnya";
  qty: number;
  unitPrice: number;
  totalPrice: number;
  status: "Pending Review" | "Approved" | "Partially Approved" | "Rejected";
  poNote?: string;
  reviewerNote?: string;
}

export interface ActivityLog {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  createdAt: string;
}

// Initial Budget Seeding
const DEFAULT_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: "bgt-101",
    eventId: "evt-01",
    itemName: "Konsumsi / Snack Box Peserta (150 Pax)",
    category: "konsumsi",
    qty: 150,
    unitPrice: 15000,
    totalPrice: 2250000,
    status: "Approved",
    poNote: "Snack box sehat tipe A dari Bu Susi.",
    reviewerNote: "Disetujui, sesuai pagu standard kemahasiswaan."
  },
  {
    id: "bgt-102",
    eventId: "evt-01",
    itemName: "Banner Backdrop Cetak Alumunium",
    category: "perlengkapan",
    qty: 1,
    unitPrice: 350000,
    totalPrice: 350000,
    status: "Approved",
    poNote: "Backdrop utama panggung ukuran 4x3 meter.",
    reviewerNote: "Disetujui."
  },
  {
    id: "bgt-103",
    eventId: "evt-01",
    itemName: "Transportasi Kereta Eksekutif Pemateri",
    category: "transportasi",
    qty: 2,
    unitPrice: 600000,
    totalPrice: 1200000,
    status: "Approved",
    poNote: "Tiket kereta PP pemateri Google Cloud Jakarta - Depok.",
    reviewerNote: "OK, mohon kuitansi dilampirkan nanti."
  },
  {
    id: "bgt-201",
    eventId: "evt-02",
    itemName: "Konsumsi Makan Siang Panitia (20 Pax)",
    category: "konsumsi",
    qty: 20,
    unitPrice: 25000,
    totalPrice: 500000,
    status: "Approved",
    poNote: "Nasi kotak siang untuk panitia dan mentor.",
    reviewerNote: "Disetujui."
  },
  {
    id: "bgt-202",
    eventId: "evt-02",
    itemName: "Sewa Akun Figma Pro (1 Bulan)",
    category: "perlengkapan",
    qty: 5,
    unitPrice: 200000,
    totalPrice: 1000000,
    status: "Pending Review",
    poNote: "5 Lisensi pro untuk bimbingan langsung di lab komputer.",
    reviewerNote: ""
  },
  {
    id: "bgt-501",
    eventId: "evt-05",
    itemName: "Sewa Panggung rigging & Sound System 5000W",
    category: "perlengkapan",
    qty: 1,
    unitPrice: 10000000,
    totalPrice: 10000000,
    status: "Pending Review",
    poNote: "Kelengkapan konser amfiteater utama.",
    reviewerNote: ""
  },
  {
    id: "bgt-502",
    eventId: "evt-05",
    itemName: "Snack box panitia & guest star",
    category: "konsumsi",
    qty: 100,
    unitPrice: 20000,
    totalPrice: 2000000,
    status: "Pending Review",
    poNote: "Konsumsi konser amal.",
    reviewerNote: ""
  },
  {
    id: "bgt-503",
    eventId: "evt-05",
    itemName: " Banner Promosi & Live Streaming Operator",
    category: "dokumentasi",
    qty: 1,
    unitPrice: 150000,
    totalPrice: 150000,
    status: "Pending Review",
    poNote: "Dokumentasi & media penyiaran digital youtube.",
    reviewerNote: ""
  }
];

// Initial Logs Seeding
const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    eventId: "evt-01",
    userId: "po@nurulfikri.ac.id",
    userName: "Rudi Hartono (PO)",
    action: "Event dibuat",
    description: "Event draft Seminar Generative AI dibuat oleh Rudi.",
    createdAt: "2026-05-25T08:00:00.000Z"
  },
  {
    id: "log-2",
    eventId: "evt-01",
    userId: "po@nurulfikri.ac.id",
    userName: "Rudi Hartono (PO)",
    action: "Event diajukan",
    description: "Event diajukan ke Kemahasiswaan untuk direview.",
    createdAt: "2026-05-26T10:30:00.000Z"
  },
  {
    id: "log-3",
    eventId: "evt-01",
    userId: "staff@nurulfikri.ac.id",
    userName: "Staf Kemahasiswaan",
    action: "Event disetujui",
    description: "Event disetujui sepenuhnya oleh Staf Kemahasiswaan.",
    createdAt: "2026-05-30T09:00:00.000Z"
  },
  {
    id: "log-4",
    eventId: "evt-05",
    userId: "po@nurulfikri.ac.id",
    userName: "Rudi Hartono (PO)",
    action: "Event diajukan",
    description: "Konser Amal & Festival Seni diajukan, menunggu review dari Staf Kemahasiswaan.",
    createdAt: "2026-06-01T10:00:00.000Z"
  }
];

export function getEvents(): EventItem[] {
  if (typeof window === "undefined") return INITIAL_EVENTS;
  const saved = localStorage.getItem("eventhub_events");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Map old status string or other values to match new flow dynamically
      return parsed.map((e: any) => {
        let mappedStatus = e.status;
        if (e.id === "evt-05" && e.status === "Pending Approval") {
          mappedStatus = "Submitted";
        } else if (e.status === "Pending Approval") {
          mappedStatus = "Submitted";
        } else if (e.status === "Buka Pendaftaran" || e.status === "Hampir Penuh" || e.status === "Tutup" || e.status === "Selesai") {
          mappedStatus = "Approved";
        }
        return {
          ...e,
          status: mappedStatus,
          purpose: e.purpose || "Dukungan ekspresi dan keilmuan civitas akademika NF.",
          po_id: e.po_id || "po@nurulfikri.ac.id",
          submitted_at: e.submitted_at || e.date,
          reviewer_id: e.reviewer_id || "staff@nurulfikri.ac.id"
        };
      });
    } catch (e) {
      return INITIAL_EVENTS;
    }
  } else {
    // Initial mapping
    const seed = INITIAL_EVENTS.map((e: any) => {
      let mappedStatus = e.status;
      if (e.id === "evt-05" && e.status === "Pending Approval") {
        mappedStatus = "Submitted";
      } else if (e.status === "Pending Approval") {
        mappedStatus = "Submitted";
      } else if (e.status === "Buka Pendaftaran" || e.status === "Hampir Penuh" || e.status === "Tutup" || e.status === "Selesai") {
        mappedStatus = "Approved";
      }
      return {
        ...e,
        status: mappedStatus,
        purpose: "Dukungan ekspresi dan keilmuan civitas akademika NF.",
        po_id: "po@nurulfikri.ac.id",
        submitted_at: e.date,
        reviewer_id: "staff@nurulfikri.ac.id"
      };
    });
    localStorage.setItem("eventhub_events", JSON.stringify(seed));
    return seed;
  }
}

export function saveEvents(events: EventItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("eventhub_events", JSON.stringify(events));
  }
}

export function getBudgetItems(eventId?: string): BudgetItem[] {
  if (typeof window === "undefined") return DEFAULT_BUDGET_ITEMS;
  const saved = localStorage.getItem("eventhub_budgets");
  let items: BudgetItem[] = [];
  if (saved) {
    try {
      items = JSON.parse(saved);
    } catch (e) {
      items = DEFAULT_BUDGET_ITEMS;
    }
  } else {
    items = DEFAULT_BUDGET_ITEMS;
    localStorage.setItem("eventhub_budgets", JSON.stringify(items));
  }

  if (eventId) {
    return items.filter((item) => item.eventId === eventId);
  }
  return items;
}

export function saveBudgetItems(items: BudgetItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("eventhub_budgets", JSON.stringify(items));
  }
}

export function getActivityLogs(eventId?: string): ActivityLog[] {
  if (typeof window === "undefined") return DEFAULT_LOGS;
  const saved = localStorage.getItem("eventhub_activity_logs");
  let logs: ActivityLog[] = [];
  if (saved) {
    try {
      logs = JSON.parse(saved);
    } catch (e) {
      logs = DEFAULT_LOGS;
    }
  } else {
    logs = DEFAULT_LOGS;
    localStorage.setItem("eventhub_activity_logs", JSON.stringify(logs));
  }

  if (eventId) {
    return logs.filter((log) => log.eventId === eventId);
  }
  return logs;
}

export function addActivityLog(eventId: string, userId: string, userName: string, action: string, description: string) {
  if (typeof window !== "undefined") {
    const logs = getActivityLogs();
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      eventId,
      userId,
      userName,
      action,
      description,
      createdAt: new Date().toISOString()
    };
    const updated = [newLog, ...logs];
    localStorage.setItem("eventhub_activity_logs", JSON.stringify(updated));
    return newLog;
  }
  return null;
}

export function getNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  const saved = localStorage.getItem("eventhub_notifications");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  } else {
    localStorage.setItem("eventhub_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
}

export function addNotification(category: "Persetujuan" | "Penting" | "Tugas" | "Pendaftaran", title: string, description: string, visibility: string[]) {
  if (typeof window !== "undefined") {
    const notifications = getNotifications();
    const newNotif: NotificationItem = {
      id: `not-${Date.now()}`,
      category,
      title,
      description,
      timestamp: new Date().toISOString(),
      isUnread: true,
      visibility
    };
    const updated = [newNotif, ...notifications];
    localStorage.setItem("eventhub_notifications", JSON.stringify(updated));
    return newNotif;
  }
  return null;
}
