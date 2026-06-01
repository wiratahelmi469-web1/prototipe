// SECTION: Navigation Left Sidebar Component
"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Calendar, 
  Award, 
  Camera, 
  CheckSquare, 
  User, 
  LogOut, 
  GraduationCap
} from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  // Handler to navigate and close sidebar drawer if in mobile mode
  const navigateTo = (path) => {
    router.push(path);
    if (onClose) onClose();
  };

  const menuItems = {
    guest: [
      { nama: "Beranda", path: "/dashboard/guest", ikon: Home },
      { nama: "Jelajahi Event", path: "/events", ikon: Calendar },
    ],
    mahasiswa: [
      { nama: "Beranda", path: "/dashboard/mahasiswa", ikon: Home },
      { nama: "Daftar Event", path: "/dashboard/mahasiswa/events", ikon: Calendar },
      { nama: "Riwayat & Sertifikat", path: "/dashboard/mahasiswa/riwayat", ikon: Award },
      { nama: "Profil", path: "/profile", ikon: User },
    ],
    panitia: [
      { nama: "Beranda", path: "/dashboard/panitia", ikon: Home },
      { nama: "Kelola Event", path: "/dashboard/panitia/events", ikon: Calendar },
      { nama: "Kelola Sertifikat", path: "/dashboard/panitia/sertifikat", ikon: Award },
      { nama: "Scan Absensi", path: "/dashboard/panitia/scan", ikon: Camera },
      { nama: "Profil", path: "/profile", ikon: User },
    ],
    po: [
      { nama: "Beranda", path: "/dashboard/po", ikon: Home },
      { nama: "Semua Event", path: "/dashboard/po/events", ikon: Calendar },
      { nama: "Approval Event", path: "/dashboard/po/approval", ikon: CheckSquare },
      { nama: "Approval Sertifikat", path: "/dashboard/po/sertifikat", ikon: Award },
      { nama: "Profil", path: "/profile", ikon: User },
    ],
    staf: [
      { nama: "Beranda", path: "/dashboard/staf", ikon: Home },
      { nama: "Daftar Event", path: "/dashboard/staf/events", ikon: Calendar },
      { nama: "Profil", path: "/profile", ikon: User },
    ],
  };

  const currentMenu = menuItems[user.role] || [];

  const handleLogoutClick = () => {
    logout();
    router.replace("/login");
    if (onClose) onClose();
  };

  // Convert role slug to formatted display badge
  const roleDisplayNames = {
    guest: "Tamu",
    mahasiswa: "Mahasiswa",
    panitia: "Divisi Acara",
    po: "Project Officer",
    staf: "Staf Kemahasiswaan",
  };

  const roleColors = {
    guest: "bg-white/10 text-white border-white/20",
    mahasiswa: "bg-white/10 text-white border-white/20",
    panitia: "bg-white/10 text-white border-white/20",
    po: "bg-white/10 text-white border-white/20",
    staf: "bg-white/10 text-white border-white/20",
  };

  const currentRoleColor = roleColors[user.role] || roleColors.guest;

  return (
    <aside id="app-sidebar" className="w-full h-full bg-[#1a56db] text-white flex flex-col justify-between py-5 border-r border-blue-800 font-sans shadow-md">
      {/* Upper branding & Navigation Links */}
      <div className="flex flex-col gap-6">
        <div className="px-5 pb-4 border-b border-blue-800 hidden md:flex items-center gap-2.5">
          <div className="bg-[#f59e0b] p-2 rounded-lg text-white font-bold flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-md tracking-tight leading-none">EventHub</h2>
            <span className="text-[10px] text-white/75 font-semibold tracking-wide block m-0">Kampus Nurul Fikri</span>
          </div>
        </div>

        {/* Links lists */}
        <nav className="flex flex-col gap-1 px-3">
          {currentMenu.map((item) => {
            const Ikon = item.ikon;
            const isAktif = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-200 cursor-pointer ${
                  isAktif
                    ? "bg-white/15 text-white font-semibold shadow-xs"
                    : "hover:bg-white/5 text-blue-100 hover:text-white"
                }`}
                id={`sidebar-link-${item.path.replace(/\//g, "-")}`}
              >
                <Ikon className={`w-5 h-5 shrink-0 ${isAktif ? "text-white" : "text-blue-200 group-hover:text-white"}`} />
                {item.nama}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer information bar */}
      <div className="px-3">
        <div className="bg-blue-800/40 border border-blue-700/50 rounded-2xl p-4 flex flex-col gap-3">
          {/* User details */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-white font-bold text-xs truncate tracking-tight">{user.nama}</span>
            <span className="text-[10px] text-blue-200 truncate">{user.email}</span>
            <div className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit uppercase leading-normal tracking-wider ${currentRoleColor}`}>
              {roleDisplayNames[user.role]}
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            id="btn-sidebar-logout"
          >
            <LogOut className="w-3.5 h-3.5 text-white/80" />
            Keluar Platform
          </button>
        </div>
      </div>
    </aside>
  );
}
