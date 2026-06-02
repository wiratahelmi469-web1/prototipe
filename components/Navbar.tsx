"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Bell, User, LogOut, Menu, X, Shield, Calendar, Layers, Layers3, Flame } from "lucide-react";
import { INITIAL_NOTIFICATIONS, NotificationItem } from "../lib/mockData";
import { formatDate } from "../lib/utils";

interface NavbarProps {
  onNotifyToggle?: () => void;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Sync / Load notifications from localStorage
  useEffect(() => {
    const savedNotifs = localStorage.getItem("eventhub_notifications");
    if (savedNotifs) {
      try {
        setNotifications(JSON.parse(savedNotifs));
      } catch (err) {
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    } else {
      localStorage.setItem("eventhub_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
      setNotifications(INITIAL_NOTIFICATIONS);
    }
  }, []);

  // Filter notifications based on the current user role
  const activeRole = user?.role || "guest";
  const userNotifications = notifications.filter(notif => 
    notif.visibility.includes(activeRole)
  );

  const unreadCount = userNotifications.filter(n => n.isUnread).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => 
      n.visibility.includes(activeRole) ? { ...n, isUnread: false } : n
    );
    localStorage.setItem("eventhub_notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleClearNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem("eventhub_notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const menuItems = [
    { name: "Event Publik", href: "/events", roles: ["guest", "mahasiswa", "panitia", "po", "staff"] },
    { name: "Dashboard", href: activeRole === "staff" ? "/dashboard/staff" : `/dashboard/${activeRole}`, roles: ["mahasiswa", "panitia", "po", "staff"] },
    { name: "Scan QR", href: "/dashboard/panitia/scan", roles: ["panitia"] },
    {
      name: "Sertifikat",
      href: activeRole === "po"
        ? "/dashboard/po/sertifikat"
        : "/dashboard/panitia/sertifikat",
      roles: ["panitia", "po"]
    },
    {
      name: "💬 Chat",
      href: activeRole === "staff"
        ? "/dashboard/staff/chat"
        : `/dashboard/${activeRole}/chat`,
      roles: ["mahasiswa", "panitia", "po", "staff"]
    }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(activeRole));

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-stone-200/80 shadow-xs" id="main_navigation_bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2" id="brand_home_link">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                <Calendar className="w-5 h-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-stone-900 leading-none">
                  EventHub Kampus
                </span>
                <span className="text-[9px] text-stone-500 font-medium tracking-wide">
                  Universitas Nurul Fikri
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1.5">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pathname === item.href
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-stone-600 hover:text-indigo-600 hover:bg-stone-50"
                }`}
                id={`nav_link_${item.name.replace(/\s+/g, "_").toLowerCase()}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions (Notif drawer + User avatar dropdown) */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            {activeRole !== "guest" && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className={`p-2 rounded-xl border border-stone-150 transition-colors relative ${
                    showNotifications ? "bg-stone-50 text-indigo-600" : "bg-white text-stone-600 hover:text-indigo-600 hover:bg-stone-50"
                  }`}
                  id="notifications_bell_btn"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200" id="notification_dropdown_panel">
                    <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-800">Notifikasi</span>
                        <span className="text-[10px] text-stone-400">Pemberitahuan role: <strong className="text-indigo-600 uppercase">{activeRole === "staff" ? "Staf" : activeRole}</strong></span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                          id="mark_all_read_btn"
                        >
                          Tandai sudah baca
                        </button>
                      )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto divide-y divide-stone-50">
                      {userNotifications.length === 0 ? (
                        <div className="p-8 text-center text-stone-400">
                          <Bell className="w-8 h-8 mx-auto text-stone-200 mb-2" />
                          <p className="text-xs">Tidak ada notifikasi baru.</p>
                        </div>
                      ) : (
                        userNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3.5 flex items-start gap-2.5 transition-colors ${
                              notif.isUnread ? "bg-indigo-50/25" : "bg-white hover:bg-stone-50"
                            }`}
                            id={`notif_item_${notif.id}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                              notif.isUnread ? "bg-indigo-600" : "bg-transparent"
                            }`} />
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-600 font-mono tracking-wider uppercase">
                                  {notif.category}
                                </span>
                                <span className="text-[9px] text-stone-400">
                                  {formatDate(notif.timestamp)}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-stone-800 leading-snug">
                                {notif.title}
                              </h5>
                              <p className="text-[11px] text-stone-500 leading-relaxed">
                                {notif.description}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleClearNotif(notif.id, e)}
                              className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700"
                              title="Hapus"
                              id={`delete_notif_${notif.id}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Quick Login Dropdown */}
            {activeRole !== "guest" ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 border border-stone-200 bg-stone-50 hover:bg-stone-100/70 rounded-full transition-colors font-semibold"
                  id="user_profile_trigger_btn"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs uppercase">
                    {user?.name?.[0] || "U"}
                  </div>
                  <span className="text-[11px] font-bold text-stone-700 max-w-[90px] truncate hidden sm:block pr-1">
                    {user?.name}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2.5 w-60 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-3 duration-200" id="profile_menu_dropdown">
                    <div className="px-4 py-2 border-b border-stone-150 flex flex-col">
                      <span className="text-xs font-bold text-stone-900 leading-snug">{user?.name}</span>
                      <span className="text-[9px] text-stone-500 font-mono truncate">{user?.email}</span>
                      <span className="mt-1.5 inline-flex w-fit items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                        <Shield className="w-3 h-3" />
                        {activeRole === "staff" ? "Staf Kemahasiswaan" : activeRole}
                      </span>
                    </div>



                    <Link
                      href={`/dashboard/${activeRole}/profile`}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-indigo-650 transition-colors border-b border-stone-105"
                      id="navbar_profile_link"
                    >
                      <User className="w-4 h-4 text-stone-400" />
                      Lihat Profil Saya
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-colors text-left"
                      id="navbar_logout_btn"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out / Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 transition-all border border-stone-200"
                  id="navbar_login_btn"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all text-center"
                  id="navbar_register_btn"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl bg-stone-50 border border-stone-250 hover:bg-stone-100 text-stone-700"
              id="mobile_menu_trigger"
            >
              {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-3 pb-4 space-y-2" id="mobile_drawer_menu">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 text-xs font-semibold rounded-lg ${
                pathname === item.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
              id={`mobile_nav_link_${item.name.replace(/\s+/g, "_").toLowerCase()}`}
            >
              {item.name}
            </Link>
          ))}
          {activeRole !== "guest" && (
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg text-left"
              id="mobile_nav_logout_btn"
            >
              <LogOut className="w-4 h-4" />
              Keluar Sesi
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
