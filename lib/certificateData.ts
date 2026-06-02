export interface CertificateTemplate {
  id: string;
  name: string;
  theme: "Classic" | "Elegant" | "Modern" | "Minimal";
  bgColor: string;
  borderColor: string;
  titleFont: string;
  accentColor: string;
}

export interface UserCertificate {
  id: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userEmail: string;
  role: "Peserta" | "Panitia" | "Pembicara";
  issueDate: string;
  certificateNumber: string;
  isApprovedByPO: boolean;
  isDistributed: boolean;
}

export const CERTIFICATE_TEMPLATES: CertificateTemplate[] = [
  {
    id: "tmpl-01",
    name: "Classic Universitas",
    theme: "Classic",
    bgColor: "bg-amber-50/40",
    borderColor: "border-amber-800",
    titleFont: "serif",
    accentColor: "#92400e" // amber-800
  },
  {
    id: "tmpl-02",
    name: "Modern Emerald",
    theme: "Elegant",
    bgColor: "bg-emerald-50/30",
    borderColor: "border-emerald-700",
    titleFont: "sans",
    accentColor: "#047857" // emerald-700
  },
  {
    id: "tmpl-03",
    name: "Corporate Sapphire",
    theme: "Modern",
    bgColor: "bg-blue-50/20",
    borderColor: "border-blue-900",
    titleFont: "sans",
    accentColor: "#1e3a8a" // blue-900
  }
];

export const INITIAL_CERTIFICATES: UserCertificate[] = [
  {
    id: "cert-01",
    eventId: "evt-01",
    eventTitle: "Seminar Generative AI & Career Masa Depan",
    userName: "Ahmad Junaidi",
    userEmail: "mahasiswa@nurulfikri.ac.id",
    role: "Peserta",
    issueDate: "2026-06-15",
    certificateNumber: "SER/HMIF-AI/2026/089",
    isApprovedByPO: true,
    isDistributed: true
  },
  {
    id: "cert-02",
    eventId: "evt-01",
    eventTitle: "Seminar Generative AI & Career Masa Depan",
    userName: "Siti Khalimah",
    userEmail: "siti_khal@nurulfikri.ac.id",
    role: "Peserta",
    issueDate: "2026-06-15",
    certificateNumber: "SER/HMIF-AI/2026/090",
    isApprovedByPO: true,
    isDistributed: false
  },
  {
    id: "cert-03",
    eventId: "evt-02",
    eventTitle: "Design Thinking & UI/UX Workshop 2026",
    userName: "Muhammad Fadhil",
    userEmail: "fadhil_mhs@nurulfikri.ac.id",
    role: "Peserta",
    issueDate: "2026-06-20",
    certificateNumber: "WS/UKMDK-DT/2026/001",
    isApprovedByPO: false,
    isDistributed: false
  },
  {
    id: "cert-04",
    eventId: "evt-04",
    eventTitle: "Turnamen Badminton Rektor Cup VII",
    userName: "Ahmad Junaidi",
    userEmail: "mahasiswa@nurulfikri.ac.id",
    role: "Peserta",
    issueDate: "2026-06-10",
    certificateNumber: "SER/RC-VII/BADM/2026/012",
    isApprovedByPO: true,
    isDistributed: true
  },
  {
    id: "cert-05",
    eventId: "evt-01",
    eventTitle: "Seminar Generative AI & Career Masa Depan",
    userName: "Andi Saputra",
    userEmail: "panitia@nurulfikri.ac.id",
    role: "Panitia",
    issueDate: "2026-06-15",
    certificateNumber: "SER/HMIF-AI/2026/PAN/001",
    isApprovedByPO: true,
    isDistributed: true
  }
];
