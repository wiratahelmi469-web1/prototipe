// SECTION: Splash Screen Entry Page
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function SplashPage() {
  const router = useRouter();
  const { loginAsGuest } = useAuth();
  
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    // 2.5s progress simulation (2500ms total, update every 25ms -> 100 steps)
    const intervalTime = 25;
    const increment = 1;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setLoadingComplete(true);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const handleGuestLogin = () => {
    loginAsGuest();
    router.push("/dashboard/guest");
  };

  return (
    <main className="min-h-[100dvh] w-full flex flex-col justify-between items-center bg-gradient-to-b from-[#1a56db] to-[#1e40af] px-4 py-8 font-sans overflow-hidden">
      {/* Spacer Upper */}
      <div className="shrink-0" />

      {/* Main Branding Block */}
      <div className="flex flex-col items-center text-center max-w-sm w-full gap-6 select-none my-auto">
        {/* Animated Icon Wrapper */}
        <div className={`bg-[#f59e0b] p-5 rounded-full text-white shadow-xl ${!loadingComplete ? "animate-pulse scale-102" : "duration-550"} transition-all`}>
          <GraduationCap className="w-16 h-16 md:w-20 md:h-20" />
        </div>

        {/* Brand Labels */}
        <div className="space-y-1.5 animate-slide-in">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
            EventHub Kampus
          </h1>
          <p className="text-xs md:text-sm text-[#f59e0b] font-bold tracking-wider uppercase">
            Universitas Nurul Fikri
          </p>
          <p className="text-xs text-white/80 italic font-medium pt-1">
            &quot;Kelola Event Kampus, Satu Platform&quot;
          </p>
        </div>

        {/* LOADING PROGRESS BLOCK */}
        {!loadingComplete ? (
          <div className="w-full max-w-[260px] flex flex-col items-center mt-6 gap-2.5 animate-fade-in">
            {/* Progress Bar Track */}
            <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-[#f59e0b] h-full rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] text-white/70 font-semibold tracking-wide">
              Menghubungkan ke sistem... {progress}%
            </span>
          </div>
        ) : (
          /* ACTION SELECTION BUTTONS - FADES IN AFTER LOADING */
          <div className="w-full flex flex-col gap-3 mt-6 animate-slide-in duration-300">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-white text-[#1a56db] font-extrabold text-sm py-4 px-6 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all hover:bg-slate-50 shadow-lg shadow-black/15"
              id="splash-btn-login"
            >
              Lanjut ke Login &rarr;
            </button>
            <button
              onClick={handleGuestLogin}
              className="w-full bg-slate-900/40 border border-white/10 text-white font-bold text-sm py-3.5 px-6 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all hover:bg-slate-900/60"
              id="splash-btn-guest"
            >
              Mulai Sebagai Tamu &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Footer Copyline */}
      <footer className="text-center text-white/50 text-xs shrink-0 select-none pb-2">
        Sistem Informasi &copy; Universitas Nurul Fikri 2026
      </footer>
    </main>
  );
}
