// SECTION: Navigation Top Bar Component
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, GraduationCap, Menu, User, LogOut, Check } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/localStorage";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Load and subscribe to notifications
  useEffect(() => {
    const loadNotifs = () => {
      const allNotifs = getLocalStorageItem("notifications", []);
      // Filter notifications relevant to current user:
      // - If notification has "email", must match user's email
      // - If notification has "role", must match user's role
      // - If both are empty, it is broadcast (everyone sees it)
      const filtered = allNotifs.filter((n) => {
        if (!user) return false;
        if (n.email && n.email.toLowerCase() !== user.email.toLowerCase()) return false;
        if (n.role && n.role !== user.role) return false;
        return true;
      });
      setNotifications(filtered);
    };

    if (user) {
      loadNotifs();
    }

    const handleSync = () => {
      loadNotifs();
    };

    window.addEventListener("notifications-updated", handleSync);
    window.addEventListener("events-updated", loadNotifs); // Sync notifications on general updates too
    return () => {
      window.removeEventListener("notifications-updated", handleSync);
      window.removeEventListener("events-updated", loadNotifs);
    };
  }, [user]);

  // Click outside to close menus
  useEffect(() => {
    const clickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const markAllAsRead = () => {
    const allNotifs = getLocalStorageItem("notifications", []);
    const updated = allNotifs.map((n) => {
      if (!user) return n;
      const isMyNotif = (!n.email && !n.role) || 
                        (n.email && n.email.toLowerCase() === user.email.toLowerCase()) || 
                        (n.role && n.role === user.role);
      if (isMyMyNotif(n)) {
        return { ...n, read: true };
      }
      return n;
    });

    setLocalStorageItem("notifications", updated);
    // Trigger sync
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const isMyMyNotif = (n) => {
    if (!user) return false;
    if (n.email && n.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (n.role && n.role === user.role) return true;
    if (!n.email && !n.role) return true;
    return false;
  };

  const markSingleRead = (id) => {
    const allNotifs = getLocalStorageItem("notifications", []);
    const updated = allNotifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setLocalStorageItem("notifications", updated);
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header id="app-navbar" className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Brand left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 md:hidden hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
          id="btn-hamburger"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")} id="brand-logo">
          <div className="bg-[#1a56db] p-1.5 rounded-lg text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-[#1a56db] tracking-tight leading-none text-lg">EventHub Kampus</h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide block">UNIVERSITAS NURUL FIKRI</span>
          </div>
        </div>
      </div>

      {/* Action right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 relative transition-colors cursor-pointer"
            id="btn-notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <span className="font-bold text-sm text-slate-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#1a56db] font-semibold hover:underline cursor-pointer"
                    id="btn-mark-all-read"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 py-6 text-xs">Belum ada notifikasi.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markSingleRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2.5 cursor-pointer ${
                        !notif.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs ${!notif.read ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                          {notif.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-0.5 max-w-full break-words">
                          {notif.message}
                        </p>
                        <span className="text-[9px] text-slate-400 block mt-1">{notif.timestamp}</span>
                      </div>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="profile-dropdown-trigger"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-inner uppercase">
              {user?.nama ? user.nama.substring(0, 2) : "TM"}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-slide-in">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="font-bold text-sm text-slate-800 tracking-tight truncate">{user?.nama || "Tamu"}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "guest@nurulfikri.ac.id"}</p>
              </div>
              <div className="py-1">
                {user?.role !== "guest" && (
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/profile");
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    id="btn-goto-profile"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Profil Saya
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer font-semibold border-t border-slate-50"
                  id="btn-navbar-logout"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
