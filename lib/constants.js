// SECTION: Data & Konstanta
export const DEMO_ACCOUNTS = [
  {
    id: "1",
    namaLengkap: "Project Officer",
    email: "po@nurulfikri.ac.id",
    password: "po123",
    role: "po",
    nimNip: "PO001",
    tanggalDaftar: "2026-01-01"
  },
  {
    id: "2",
    namaLengkap: "Divisi Acara",
    email: "panitia@nurulfikri.ac.id",
    password: "panitia123",
    role: "panitia",
    nimNip: "PAN001",
    tanggalDaftar: "2026-01-01"
  },
  {
    id: "3",
    namaLengkap: "Budi Santoso",
    email: "mahasiswa@nurulfikri.ac.id",
    password: "mhs123",
    role: "mahasiswa",
    nimNip: "2021001",
    tanggalDaftar: "2026-01-01"
  },
  {
    id: "4",
    namaLengkap: "Staf Kemahasiswaan",
    email: "staff@nurulfikri.ac.id",
    password: "staff123",
    role: "staf",
    nimNip: "STF001",
    tanggalDaftar: "2026-01-01"
  }
];

export const DUMMY_EVENTS = [
  {
    id: "EVT001",
    nama: "Seminar Nasional AI & Transformasi Digital",
    kategori: "Seminar",
    tanggal: "2026-07-15",
    jam: "08.00 - 17.00 WIB",
    lokasi: "Aula Utama Gedung A",
    penyelenggara: "Divisi Akademik BEM",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 200,
    kuotaTerisi: 143,
    status: "approved",
    eventStatus: "buka",
    tanggalDiajukan: "2026-06-01",
    deskripsi: "Seminar membahas peran AI dalam dunia pendidikan dan industri digital.",
    sertifikatStatus: null,
    peserta: [
      {
        nim: "2021001",
        nama: "Budi Santoso",
        email: "mahasiswa@nurulfikri.ac.id",
        statusHadir: "menunggu",
        jamScan: null,
        nomorSertifikat: "CERT-2026-EVT001-2021001",
        sertifikatDownloaded: false
      }
    ]
  },
  {
    id: "EVT002",
    nama: "Workshop UI/UX Design Thinking",
    kategori: "Workshop",
    tanggal: "2026-07-22",
    jam: "09.00 - 15.00 WIB",
    lokasi: "Lab Komputer Lantai 3",
    penyelenggara: "Himpunan Sistem Informasi",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 50,
    kuotaTerisi: 50,
    status: "approved",
    eventStatus: "tutup",
    tanggalDiajukan: "2026-06-05",
    deskripsi: "Workshop intensif design thinking dan prototyping dengan Figma.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT003",
    nama: "Lomba Karya Tulis Ilmiah 2026",
    kategori: "Lomba",
    tanggal: "2026-08-05",
    jam: "08.00 WIB",
    lokasi: "Online (Zoom)",
    penyelenggara: "UKM Penelitian",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 100,
    kuotaTerisi: 28,
    status: "approved",
    eventStatus: "buka",
    tanggalDiajukan: "2026-06-10",
    deskripsi: "Lomba KTI tingkat nasional berhadiah total 15 juta rupiah.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT004",
    nama: "Pelatihan Public Speaking",
    kategori: "Workshop",
    tanggal: "2026-06-10",
    jam: "13.00 - 17.00 WIB",
    lokasi: "Ruang Seminar B",
    penyelenggara: "UKM Debat",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 60,
    kuotaTerisi: 60,
    status: "approved",
    eventStatus: "selesai",
    tanggalDiajukan: "2026-05-01",
    deskripsi: "Pelatihan berbicara di depan umum oleh praktisi nasional.",
    sertifikatStatus: "approved",
    peserta: [
      {
        nim: "2021001",
        nama: "Budi Santoso",
        email: "mahasiswa@nurulfikri.ac.id",
        statusHadir: "hadir",
        jamScan: "09:15:32",
        nomorSertifikat: "CERT-2026-EVT004-2021001",
        sertifikatDownloaded: false
      }
    ]
  },
  {
    id: "EVT005",
    nama: "Turnamen Futsal Antar Jurusan",
    kategori: "Olahraga",
    tanggal: "2026-08-20",
    jam: "07.00 WIB",
    lokasi: "Lapangan Futsal Kampus",
    penyelenggara: "UKM Olahraga",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 80,
    kuotaTerisi: 12,
    status: "approved",
    eventStatus: "buka",
    tanggalDiajukan: "2026-06-15",
    deskripsi: "Turnamen futsal berhadiah antar jurusan se-kampus.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT006",
    nama: "Malam Keakraban Mahasiswa Baru",
    kategori: "Sosial",
    tanggal: "2026-09-01",
    jam: "19.00 - 22.00 WIB",
    lokasi: "Gedung Serba Guna",
    penyelenggara: "Panitia OSPEK",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 500,
    kuotaTerisi: 89,
    status: "approved",
    eventStatus: "segera",
    tanggalDiajukan: "2026-06-20",
    deskripsi: "Acara keakraban dan pengenalan kampus untuk mahasiswa baru.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT007",
    nama: "Hackathon Kampus 2026",
    kategori: "Lomba",
    tanggal: "2026-08-10",
    jam: "08.00 WIB",
    lokasi: "Lab Inovasi Gedung C",
    penyelenggara: "Himpunan Informatika",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 120,
    kuotaTerisi: 0,
    status: "pending_approval",
    eventStatus: "segera",
    tanggalDiajukan: "2026-06-28",
    deskripsi: "Hackathon 24 jam membangun solusi digital untuk kampus.",
    sertifikatStatus: null,
    peserta: []
  },
  {
    id: "EVT008",
    nama: "Webinar Karir & Industri IT",
    kategori: "Seminar",
    tanggal: "2026-07-30",
    jam: "14.00 - 16.00 WIB",
    lokasi: "Online (Google Meet)",
    penyelenggara: "Divisi Karir BEM",
    pengajuEmail: "panitia@nurulfikri.ac.id",
    kuotaMax: 300,
    kuotaTerisi: 0,
    status: "pending_approval",
    eventStatus: "segera",
    tanggalDiajukan: "2026-06-29",
    deskripsi: "Webinar bersama praktisi IT dari perusahaan teknologi terkemuka.",
    sertifikatStatus: null,
    peserta: []
  }
];

export const KATEGORI_EVENT = [
  "Seminar", "Workshop", "Lomba",
  "Sosial", "Olahraga", "Budaya", "Lainnya"
];

export const WARNA_KATEGORI = {
  Seminar  : "from-blue-500 to-blue-700",
  Workshop : "from-purple-500 to-purple-700",
  Lomba    : "from-yellow-500 to-orange-600",
  Sosial   : "from-green-500 to-green-700",
  Olahraga : "from-red-500 to-red-700",
  Budaya   : "from-pink-500 to-pink-700",
  Lainnya  : "from-gray-500 to-gray-700"
};
