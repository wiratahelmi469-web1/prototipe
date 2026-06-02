"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Calendar, Sparkles, Shield, Rocket } from "lucide-react";
import { motion } from "motion/react";

export default function EntrySplashPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Progress bar simulation matching the 2.5-second splash requirement
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 90);

    const redirectTimeout = setTimeout(() => {
      if (user?.isLoggedIn) {
        if (user.role === "staff") {
          router.push("/dashboard/staff");
        } else {
          router.push(`/dashboard/${user.role}`);
        }
      } else {
        router.push("/events");
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimeout);
    };
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-950 text-white relative overflow-hidden" id="splash_screen_viewport">
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />

      <div className="z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* Animated Brand Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="p-4.5 bg-indigo-600/30 border border-indigo-500/40 rounded-3xl mb-6 shadow-2xl relative"
        >
          <Calendar className="w-10 h-10 text-indigo-400" />
          <span className="absolute -top-1 -right-1 p-1 bg-yellow-400 rounded-full text-indigo-950">
            <Sparkles className="w-3.5 h-3.5 fill-yellow-400" />
          </span>
        </motion.div>

        {/* Header Display */}
        <motion.h1
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-2xl font-black tracking-tight"
        >
          EventHub Kampus
        </motion.h1>
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-xs text-indigo-300 font-medium tracking-wide mt-1.5 leading-relaxed"
        >
          Pusat Koordinasi Kegiatan Mahasiswa, Registrasi Pengunjung &amp; Distribusi Sertifikat Digital
        </motion.p>

        {/* Progress Container */}
        <div className="w-full bg-indigo-950 border border-indigo-900 h-2.5 rounded-full mt-10 overflow-hidden relative p-[1px]">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_#6366f1]"
            style={{ width: `${percent}%` }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-semibold font-mono tracking-wider mt-4 uppercase"
        >
          <span>MENYIAPKAN RUANG DASHBOARD</span>
          <span>{percent}%</span>
        </motion.div>
      </div>

      {/* Humble footnote */}
      <div className="absolute bottom-6 left-0 right-0 text-center opacity-40 text-[9px] font-mono tracking-widest uppercase">
        Universitas Nurul Fikri • 2026
      </div>
    </div>
  );
}
