export interface EventItem {
  id: string;
  title: string;
  category: "Seminar" | "Workshop" | "Lomba" | "Olahraga" | "Seni" | "Sosial";
  organizer: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  status: "Buka Pendaftaran" | "Hampir Penuh" | "Tutup" | "Selesai" | "Pending Approval";
  progress: number; // For staff / panitia monitoring
  pesertaCount: number;
  urgentTasksCount: number;
  description: string;
  coordinator: string;
}

export interface TaskItem {
  id: string;
  eventId: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  assignee: string;
  status: "todo" | "progress" | "done";
}

export interface RundownItem {
  id: string;
  eventId: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  pic: string;
  location: string;
  isLive: boolean;
  isCompleted: boolean;
}

export interface ChatMessage {
  id: string;
  eventId: string;
  sender: string;
  role: "PO" | "Panitia" | "Mahasiswa" | "Staf";
  isMe: boolean;
  message: string;
  timestamp: string;
  avatar?: string;
}

export interface DivisionProgress {
  name: string;
  status: "Lancar" | "Ada Kendala" | "Terlambat";
  progress: number;
  doneCount: number;
  activeCount: number;
}

export interface NotificationItem {
  id: string;
  category: "Penting" | "Tugas" | "Pendaftaran" | "Persetujuan";
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
  hasQuickAction?: boolean;
  visibility: string[]; // ['mahasiswa', 'panitia', 'po', 'staff', 'guest']
  isInternal?: boolean;
}

// Initial Mock data
export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-01",
    title: "Seminar Generative AI & Career Masa Depan",
    category: "Seminar",
    organizer: "Himpunan Mahasiswa Teknik Informatika (HMIF)",
    date: "2026-06-15",
    time: "09:00 - 12:00 WIB",
    location: "Aula Utama Kampus B",
    isOnline: false,
    status: "Buka Pendaftaran",
    progress: 80,
    pesertaCount: 145,
    urgentTasksCount: 2,
    coordinator: "Andi Saputra",
    description: "Seminar interaktif bersama expert dari Google Cloud membahas pemanfaatan LLM dan teknologi AI dalam dunia kerja modern serta mempersiapkan mahasiswa menghadapi transformasi digital."
  },
  {
    id: "evt-02",
    title: "Design Thinking & UI/UX Workshop 2026",
    category: "Workshop",
    organizer: "UKM Desain Kreatif",
    date: "2026-06-20",
    time: "13:00 - 17:00 WIB",
    location: "Lab Komputer 3",
    isOnline: false,
    status: "Hampir Penuh",
    progress: 45,
    pesertaCount: 38,
    urgentTasksCount: 4,
    coordinator: "Siti Rahma",
    description: "Workshop intensif dari core concept hingga prototyping menggunakan tools UI/UX terbimbing. Peserta akan memecahkan studi kasus nyata perkuliahan."
  },
  {
    id: "evt-03",
    title: "Hackathon Kampus Merdeka: EduTech Innovation",
    category: "Lomba",
    organizer: "BEM Fakultas Ilmu Komputer",
    date: "2026-07-01",
    time: "08:00 WIB - Selesai",
    location: "Virtual Zoom & Hybrid Lab",
    isOnline: true,
    status: "Buka Pendaftaran",
    progress: 25,
    pesertaCount: 72,
    urgentTasksCount: 5,
    coordinator: "Rian Hidayat",
    description: "Kompetisi problem-solving 48 jam untuk menciptakan inovasi digital di bidang pendidikan dengan bimbingan mentor industri terkemuka."
  },
  {
    id: "evt-04",
    title: "Turnamen Badminton Rektor Cup VII",
    category: "Olahraga",
    organizer: "UKM Badminton",
    date: "2026-06-10",
    time: "08:00 - 16:00 WIB",
    location: "Student Hall GOR Kampus A",
    isOnline: false,
    status: "Buka Pendaftaran",
    progress: 100,
    pesertaCount: 64,
    urgentTasksCount: 0,
    coordinator: "Budi Santoso",
    description: "Kejuaraan tahunan bulu tangkis antar program studi untuk memperebutkan piala bergilir Rektor Universitas Nurul Fikri."
  },
  {
    id: "evt-05",
    title: "Konser Amal & Festival Seni Mahasiswa",
    category: "Seni",
    organizer: "UKM Paduan Suara & Musik",
    date: "2026-07-10",
    time: "19:00 - 22:00 WIB",
    location: "Amfiteater Terbuka Kampus",
    isOnline: false,
    status: "Pending Approval",
    progress: 10,
    pesertaCount: 0,
    urgentTasksCount: 3,
    coordinator: "Clara Amalia",
    description: "Malam penggalangan dana kemanusiaan yang dikemas dengan pagelaran seni tradisional, paduan suara, serta guest star alumni berprestasi."
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  { id: "tsk-01", eventId: "evt-01", title: "Finalisasi MOU Pembicara Google Cloud", priority: "High", dueDate: "2026-06-05", assignee: "Andi Saputra", status: "progress" },
  { id: "tsk-02", eventId: "evt-01", title: "Pemesanan Konsumsi & Snack Box", priority: "Medium", dueDate: "2026-06-12", assignee: "Yuli Anita", status: "todo" },
  { id: "tsk-03", eventId: "evt-01", title: "Pembuatan Flyer Pendaftaran & Poster", priority: "Medium", dueDate: "2026-06-03", assignee: "Hadi Kusuma", status: "done" },
  { id: "tsk-04", eventId: "evt-02", title: "Konfirmasi Ketersediaan Ruang Lab 3", priority: "High", dueDate: "2026-06-10", assignee: "Siti Rahma", status: "done" },
  { id: "tsk-05", eventId: "evt-02", title: "Instalasi Figma Edu Standard di Lab", priority: "Medium", dueDate: "2026-06-18", assignee: "Hasanudin", status: "todo" },
  { id: "tsk-06", eventId: "evt-02", title: "Penyusunan Slide Handout & Template UI", priority: "High", dueDate: "2026-06-15", assignee: "Siti Rahma", status: "progress" },
  { id: "tsk-07", eventId: "evt-03", title: "Broadcast Publikasi ke Seluruh BEM", priority: "High", dueDate: "2026-06-12", assignee: "Rian Hidayat", status: "progress" },
  { id: "tsk-08", eventId: "evt-03", title: "Pemberkasan Proposal Sponsor Telkom", priority: "High", dueDate: "2026-06-08", assignee: "Fajar Sidik", status: "progress" },
  { id: "tsk-09", eventId: "evt-05", title: "Surat Izin Penggunaan Amfiteater", priority: "High", dueDate: "2026-06-10", assignee: "Clara Amalia", status: "todo" },
  { id: "tsk-10", eventId: "evt-05", title: "Proposal Anggaran Konser ke PO", priority: "High", dueDate: "2026-06-04", assignee: "Clara Amalia", status: "progress" }
];

export const INITIAL_RUNDOWN: RundownItem[] = [
  { id: "rdn-01", eventId: "evt-01", timeStart: "08:30", timeEnd: "09:00", title: "Registrasi Peserta & Pembagian Souvenir", pic: "Divisi Registrasi", location: "Depan Aula Utama", isLive: false, isCompleted: true },
  { id: "rdn-02", eventId: "evt-01", timeStart: "09:00", timeEnd: "09:15", title: "Sambutan Ketua Pelaksana & Rektor", pic: "Andi Saputra", location: "Stage Utama", isLive: true, isCompleted: false },
  { id: "rdn-03", eventId: "evt-01", timeStart: "09:15", timeEnd: "10:30", title: "Sesi I: Pengenalan AI & Pergeseran Industri", pic: "Speaker Google", location: "Stage Utama", isLive: false, isCompleted: false },
  { id: "rdn-04", eventId: "evt-01", timeStart: "10:30", timeEnd: "11:45", title: "Sesi II & Bedah Tools GenAI Praktis", pic: "Siti Nurjanah", location: "Stage Utama", isLive: false, isCompleted: false },
  { id: "rdn-05", eventId: "evt-02", timeStart: "13:00", timeEnd: "13:30", title: "Pembagian Akun Figma & Briefing Kasus", pic: "Hasanudin", location: "Lab Komputer 3", isLive: false, isCompleted: true },
  { id: "rdn-06", eventId: "evt-02", timeStart: "13:30", timeEnd: "15:00", title: "Materi Empathy Map & User Persona Creation", pic: "Siti Rahma", location: "Lab Komputer 3", isLive: false, isCompleted: false },
  { id: "rdn-07", eventId: "evt-03", timeStart: "08:00", timeEnd: "09:00", title: "Opening Ceremony Hackathon Merdeka", pic: "Rian Hidayat", location: "Zoom Ballroom", isLive: false, isCompleted: false },
  { id: "rdn-08", eventId: "evt-04", timeStart: "08:00", timeEnd: "12:00", title: "Babak Penyisihan Tunggal & Ganda Putra", pic: "Koordinator Lapangan", location: "Student Hall GOR", isLive: false, isCompleted: true }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "not-01",
    category: "Persetujuan",
    title: "Pengajuan Event Baru: Konser Amal Seni",
    description: "Wahai PO, panitia telah mengajukan proposal untuk Konser Amal Seni pada 10 Juli 2026. Segera review anggran dan rundown.",
    timestamp: "2026-06-01T10:00:00Z",
    isUnread: true,
    hasQuickAction: true,
    visibility: ["po"]
  },
  {
    id: "not-02",
    category: "Tugas",
    title: "Deadline Tugas Terdekat: Finalisasi MOU",
    description: "Andi Saputra, tugas 'Finalisasi MOU Pembicara Google' tersisa 3 hari lagi. Pastikan draf siap cetak.",
    timestamp: "2026-05-31T14:30:00Z",
    isUnread: true,
    visibility: ["panitia"]
  },
  {
    id: "not-03",
    category: "Pendaftaran",
    title: "Pendaftaran Berhasil!",
    description: "Kamu telah sukses terdaftar dalam 'Seminar Generative AI & Career Masa Depan'. Amankan tiket QR di halaman riwayat.",
    timestamp: "2026-06-02T04:10:00Z",
    isUnread: false,
    visibility: ["mahasiswa"]
  },
  {
    id: "not-04",
    category: "Penting",
    title: "Kuota Hampir Habis!",
    description: "Sisa kuota untuk Design Thinking & UI/UX Workshop tinggal 5 kursi lagi. Buruan registrasi!",
    timestamp: "2026-06-02T05:00:00Z",
    isUnread: true,
    visibility: ["mahasiswa", "guest"]
  },
  {
    id: "not-05",
    category: "Persetujuan",
    title: "Status Event Disetujui",
    description: "Proposal Seminar Generative AI telah disetujui sepenuhnya oleh Staf Kemahasiswaan dan PO. Pendaftaran dibuka!",
    timestamp: "2026-05-30T09:00:00Z",
    isUnread: false,
    visibility: ["panitia", "po"]
  },
  {
    id: "not-06",
    category: "Penting",
    title: "Monitoring Mingguan Event Kampus",
    description: "Halo Staf, 4 event sedang aktif berjalan dalam fase pendaftaran minggu ini. Monitor status kelayakan sarana.",
    timestamp: "2026-06-01T08:00:00Z",
    isUnread: true,
    visibility: ["staff"]
  },
  {
    id: "not-07",
    category: "Tugas",
    title: "Revisi Rundown Event Lomba",
    description: "Rian, PO menyarankan menambahkan sesi istirahat 1 jam sebelum babak final Hackathon.",
    timestamp: "2026-06-01T15:20:00Z",
    isUnread: true,
    visibility: ["panitia"]
  },
  {
    id: "not-08",
    category: "Penting",
    title: "Sertifikat Elektronik Tersedia",
    description: "Sertifikat elektronik untuk Rektor Cup VII sudah disetujui PO dan siap diunduh oleh peserta resmi.",
    timestamp: "2026-05-29T17:40:00Z",
    isUnread: false,
    visibility: ["mahasiswa"]
  },
  {
    id: "not-09",
    category: "Pendaftaran",
    title: "Registrasi Ditutup: Rektor Cup VII",
    description: "Pendaftaran Rektor Cup VII telah resmi ditutup karena slot peserta sudah terpenuhi.",
    timestamp: "2026-05-28T10:00:00Z",
    isUnread: false,
    visibility: ["mahasiswa", "guest", "staff"]
  },
  {
    id: "not-10",
    category: "Persetujuan",
    title: "Permintaan Tanda Tangan PO",
    description: "Panitia mengajukan tanda tangan digital Anda untuk template sertifikat Hackathon Kampus.",
    timestamp: "2026-06-02T01:30:00Z",
    isUnread: true,
    hasQuickAction: true,
    visibility: ["po"]
  }
];

export const INITIAL_CHATS: ChatMessage[] = [
  { id: "ch-01", eventId: "evt-01", sender: "Andi Saputra", role: "Panitia", isMe: false, message: "Guys, pembicara dari Google Cloud udah confirm jadwal 15 Juni jam 9 pagi ya.", timestamp: "09:12" },
  { id: "ch-02", eventId: "evt-01", sender: "Yuli Anita", role: "Panitia", isMe: false, message: "Keren! Untuk snack box apakah kita pakai vendor langganan?", timestamp: "09:14" },
  { id: "ch-03", eventId: "evt-01", sender: "Andi Saputra", role: "Panitia", isMe: false, message: "Iya, vendor Bu Susi aja yang hemat paket komplit.", timestamp: "09:15" },
  { id: "ch-04", eventId: "evt-01", sender: "Rudi PO", role: "PO", isMe: false, message: "MOU kerjasama mohon dikirim ke saya ya untuk tanda tangan basah sore ini.", timestamp: "09:22" }
];

export const DIVISION_PROGRESS: DivisionProgress[] = [
  { name: "Acara & Rundown", status: "Lancar", progress: 85, doneCount: 6, activeCount: 1 },
  { name: "Humas & Publikasi", status: "Lancar", progress: 90, doneCount: 4, activeCount: 1 },
  { name: "Perlengkapan & Logistik", status: "Ada Kendala", progress: 50, doneCount: 2, activeCount: 2 },
  { name: "Konsumsi & Registrasi", status: "Terlambat", progress: 30, doneCount: 1, activeCount: 3 }
];
