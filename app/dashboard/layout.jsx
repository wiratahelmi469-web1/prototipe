// SECTION: Dashboard Structure Layout
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-800 font-sans" id="dashboard-container">
      {/* PERSISTENT SIDEBAR - DESKTOP ONLY */}
      <div className="hidden md:block w-60 shrink-0 h-full">
        <Sidebar />
      </div>

      {/* DRAWER SIDEBAR - MOBILE MODE */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex overflow-hidden" id="mobile-sidebar-drawer">
          {/* Overlay mask */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
            id="mobile-drawer-overlay"
          />

          {/* Sidebar window */}
          <div className="relative flex-1 flex flex-col max-w-[260px] w-full h-full bg-[#1a56db] border-r border-blue-800 animate-slide-in duration-200">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* RIGHT MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header navbar */}
        <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Dynamic page content container */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8" id="dashboard-main-content">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
