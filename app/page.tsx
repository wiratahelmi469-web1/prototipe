"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Calendar, Sparkles, Shield, Users, Award, ArrowRight, LogIn, UserPlus, Compass } from "lucide-react";
import { motion } from "motion/react";

export default function EntrySplashPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [percent, setPercent] = useState(0);
  const [loadingFinished, setLoadingFinished] = useState(false);

  // Stats to display on landing
  const [stats, setStats] = useState({
    eventsCount: 8,
    participantsCount: 32,
    certsCount: 12,
  });

  useEffect(() => {
    // Dynamic progress bar simulation
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (percent === 100) {
      // Small pause for visual smoothness
      const timeout = setTimeout(() => {
        if (user?.isLoggedIn) {
          if (user.role === "staff") {
            router.push("/dashboard/staff");
          } else {
            router.push(`/dashboard/${user.role}`);
          }
        } else {
          setLoadingFinished(true);
        }
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [percent, user, router]);

  useEffect(() => {
    // Fetch stats from localStorage to make landing page data accurate
    if (typeof window !== "undefined") {
      try {
        const savedEvents = localStorage.getItem("eventhub_events");
        const savedCerts = localStorage.getItem("eventhub_certs");
        const savedReg = localStorage.getItem("eventhub_registered_users");

        let eventsLen = 8;
        if (savedEvents) {
          const parsed = JSON.parse(savedEvents);
          if (Array.isArray(parsed)) eventsLen = parsed.length;
        }

        let certsLen = 12;
        if (savedCerts) {
          const parsed = JSON.parse(savedCerts);
          if (Array.isArray(parsed)) certsLen = parsed.length;
        }

        let regLen = 32;
        if (savedReg) {
          const parsed = JSON.parse(savedReg);
          if (Array.isArray(parsed)) regLen = parsed.length;
        }

        setStats({
          eventsCount: eventsLen,
          participantsCount: regLen,
          certsCount: certsLen,
        });
      } catch (e) {
        // Fallback defaults
      }
    }
  }, [loadingFinished]);

  // Render Splash Screen loading
  if (!loadingFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F1E3C] text-white relative overflow-hidden" id="splash_screen_viewport">
        {/* Decorative Blur Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" />

        <div className="z-10 flex flex-col items-center text-center px-4 max-w-sm">
          {/* Animated Brand Logo with Gold details */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 bg-indigo-950/80 border border-[#F5A623]/30 rounded-3xl mb-6 shadow-2xl relative"
          >
            <Calendar className="w-12 h-12 text-[#F5A623]" />
            <span className="absolute -top-1 -right-1 p-1 bg-[#F5A623] rounded-full text-[#0F1E3C]">
              <Sparkles className="w-4 h-4 fill-[#0F1E3C]" />
            </span>
          </motion.div>

          {/* Header Display */}
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-3xl font-black tracking-tight font-sans text-white"
          >
            Event<span className="text-[#F5A623]">Hub</span> Kampus
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-xs text-stone-300 font-medium tracking-wide mt-2 leading-relaxed"
          >
            Pusat Koordinasi Kegiatan Mahasiswa, Registrasi Pengunjung &amp; Distribusi Sertifikat Digital
          </motion.p>

          {/* Elegant Progress Container */}
          <div className="w-64 bg-slate-900 border border-slate-700/50 h-2.5 rounded-full mt-10 overflow-hidden relative p-[1px]">
            <div
              className="bg-[#F5A623] h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_#F5A623]"
              style={{ width: `${percent}%` }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-1.5 text-[10px] text-stone-300 font-bold font-mono tracking-wider mt-4 uppercase"
          >
            <span>MENYIAPKAN RUANG AKADEMIK</span>
            <span className="text-[#F5A623]">{percent}%</span>
          </motion.div>
        </div>

        {/* Humble footnote */}
        <div className="absolute bottom-6 left-0 right-0 text-center opacity-50 text-[10px] font-mono tracking-widest text-stone-200">
          UNIVERSITAS NURUL FIKRI • 2026
        </div>
      </div>
    );
  }

  // Render glorious interactive Modern-Academic Landing Page
  return (
    <div className="min-h-screen bg-off-white text-gray-dark flex flex-col justify-between font-body" id="completed_landing_viewport">
      {/* Dynamic Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-25 -z-10" />

      {/* Decorative colored glow panels */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gold/5 rounded-bl-full filter blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-navy/5 rounded-tr-full filter blur-3xl -z-10 pointer-events-none" />

      {/* Modern Academic Header Navbar */}
      <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50 px-4 py-4" id="landing_clean_header">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-navy rounded-xl text-gold shadow-sm">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-sm font-black tracking-tight text-navy font-heading">
                Event<span className="text-gold font-black">Hub</span> Kampus
              </h1>
              <p className="text-[9px] font-bold font-mono tracking-wide text-gray-muted uppercase leading-none">Universitas Nurul Fikri</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 font-heading">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 text-xs font-bold text-gray-dark hover:text-[#0F1E3C] transition-colors"
              id="landing_nav_login"
            >
              Log In
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 bg-navy hover:bg-navy-mid text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              id="landing_nav_register"
            >
              Daftar Akun
            </button>
          </div>
        </div>
      </header>

      {/* Glorious Main Hero & Pillar Cards section */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-16 grow flex flex-col justify-center space-y-16">
        
        {/* Dynamic Typography Hero Container */}
        <div className="text-center max-w-3xl mx-auto space-y-6" id="landing_hero_segment">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-gold-tint border border-gold/30 rounded-full text-gold-dark text-[10px] font-black uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 fill-gold" />
            PLATFORM RESMI UNIVERSITAS NURUL FIKRI 2026
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl md:text-5xl font-black font-heading tracking-tight text-navy leading-none"
          >
            Pusat Koordinasi <span className="text-gold underline decoration-gold/20 underline-offset-8">Kegiatan Mahasiswa</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-dark/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Satu pintu untuk sirkulasi persetujuan acara, sistem pendataan peserta dinamis dengan validasi presensi elektronik, hingga pengarsipan e-sertifikat resmi berpenandatangan digital langsung oleh Project Owner (PO) dan Staf Kemahasiswaan.
          </motion.p>

          {/* Interactive CTA Buttons Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4"
            id="landing_cta_buttons"
          >
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-7 py-3.5 bg-navy hover:bg-navy-mid text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-heading"
              id="landing_cta_coordinator"
            >
              <LogIn className="w-4 h-4" />
              Masuk sebagai Koordinator
            </button>

            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto px-7 py-3.5 bg-gold hover:bg-gold-dark text-[#4A2E00] font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-heading"
              id="landing_cta_participant"
            >
              <UserPlus className="w-4 h-4" />
              Daftar sebagai Peserta
            </button>

            <button
              onClick={() => router.push("/events")}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-navy-tint border border-[#E2E8F0] text-navy font-extrabold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer font-heading"
              id="landing_cta_explore"
            >
              <Compass className="w-4 h-4 text-navy-light" />
              Eksplorasi Event Aktif
              <ArrowRight className="w-3.5 h-3.5 text-navy-light" />
            </button>
          </motion.div>
        </div>

        {/* Dynamic counts and stats indicator row - Styled with Container bg #0F1E3C, label Gold, angka White, deskripsi Gray-Muted */}
        <div className="grid grid-cols-3 max-w-3xl mx-auto w-full gap-4 p-6 bg-navy border border-navy-mid rounded-2xl shadow-lg" id="landing_stats_row">
          <div className="text-center">
            <span className="block text-[10px] md:text-sm font-bold text-gold uppercase tracking-wider font-heading mb-1">Total Agenda</span>
            <span className="block text-2xl md:text-4.5xl font-black text-white tracking-tight font-mono">{stats.eventsCount}</span>
            <span className="block text-[9px] text-gray-muted mt-1 uppercase">Sirkulasi Aktif</span>
          </div>
          <div className="text-center border-x border-navy-light/40">
            <span className="block text-[10px] md:text-sm font-bold text-gold uppercase tracking-wider font-heading mb-1">Anggota Register</span>
            <span className="block text-2xl md:text-4.5xl font-black text-white tracking-tight font-mono">{stats.participantsCount}+</span>
            <span className="block text-[9px] text-gray-muted mt-1 uppercase">Siswa Terdaftar</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] md:text-sm font-bold text-gold uppercase tracking-wider font-heading mb-1">Sertifikat Terbit</span>
            <span className="block text-2xl md:text-4.5xl font-black text-white tracking-tight font-mono">{stats.certsCount}</span>
            <span className="block text-[9px] text-gray-muted mt-1 uppercase">Sah Terarsip</span>
          </div>
        </div>

        {/* Product Pillars: Three Core Functions */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-1">
            <h3 className="text-xs font-black uppercase text-gold tracking-widest font-heading">ALUR FITUR UTAMA</h3>
            <p className="text-lg font-bold text-navy font-heading">Tiga Pilar Integrasi Kemahasiswaan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="landing_pillars_grid">
            {/* Pillar 1 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6.5 shadow-xs hover:shadow-md transition-all space-y-4">
              <span className="inline-flex p-3 rounded-xl bg-navy-tint text-navy-mid border border-navy-light/10">
                <Shield className="w-5 h-5" />
              </span>
              <div className="space-y-1.5 flex flex-col">
                <h4 className="font-bold text-sm text-navy font-heading">1. Koordinator Dashboard</h4>
                <p className="text-xs text-gray-dark leading-relaxed">
                  Pusat persetujuan proposal kegiatan, pemantauan agenda dewan kemahasiswaan, monitoring anggaran, dan kelayakan sertifikat.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6.5 shadow-xs hover:shadow-md transition-all space-y-4">
              <span className="inline-flex p-3 rounded-xl bg-gold-tint text-gold-dark border border-gold/10">
                <Users className="w-5 h-5" />
              </span>
              <div className="space-y-1.5 flex flex-col">
                <h4 className="font-bold text-sm text-navy font-heading">2. Registrasi Pengunjung</h4>
                <p className="text-xs text-gray-dark leading-relaxed">
                  Pendaftaran event kemahasiswaan berbasis single sign-on NIM mahasiswa. Presensi tervalidasi panitia divalidasi langsung di tempat.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6.5 shadow-xs hover:shadow-md transition-all space-y-4">
              <span className="inline-flex p-3 rounded-xl bg-green-50 text-green-700 border border-green-100">
                <Award className="w-5 h-5" />
              </span>
              <div className="space-y-1.5 flex flex-col">
                <h4 className="font-bold text-sm text-navy font-heading">3. Distribusi Sertifikat</h4>
                <p className="text-xs text-gray-dark leading-relaxed">
                  Pencetakan massal otomatis dengan tanda tangan digital resmi. Peserta dapat melihat, mengunduh, dan mencetak dokumen kapan pun.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Elegant Academic Footer - bg #0F1E3C, teks #8A99B3, Divider, Link hover gold */}
      <footer className="bg-navy text-gray-muted py-10 px-4 mt-auto border-t border-navy-mid" id="landing_clean_footer">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-xs font-extrabold tracking-wide text-white font-heading">EventHub Universitas Nurul Fikri</p>
            <p className="text-[10px] text-gray-muted/80 font-medium">Sistem Penyelenggaraan &amp; Akreditasi Kegiatan Mahasiswa Terpercaya</p>
          </div>
          <div className="text-[10px] font-mono tracking-widest text-[#F5A623] uppercase">
            © 2026 UNIVERSITAS NURUL FIKRI · SEMUA HAK CIPTA DILINDUNGI
          </div>
        </div>
      </footer>
    </div>
  );
}
