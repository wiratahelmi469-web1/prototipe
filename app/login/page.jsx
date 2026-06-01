// SECTION: Login & Account Registration Page
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Hash,
  BriefcaseSquare
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import useToast from "@/hooks/useToast";
import Modal from "@/components/Modal";
import { DEMO_ACCOUNTS } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [showPwd, setShowPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showRegConfirmPwd, setShowRegConfirmPwd] = useState(false);

  // States: LOGIN
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // States: REGISTER
  const [regNama, setRegNama] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regNimNip, setRegNimNip] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [regConfirmPwd, setRegConfirmPwd] = useState("");
  const [regAgreed, setRegAgreed] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Field validation structures
  const [regErrors, setRegErrors] = useState({});

  // Dynamic strength estimator computed directly during render
  const getPwdStrength = () => {
    if (!regPwd) {
      return { label: "", color: "bg-slate-200", percent: "w-0" };
    }
    const hasMix = /[a-zA-Z]/.test(regPwd) && /[0-9]/.test(regPwd);
    if (regPwd.length < 8) {
      return { label: "Lemah (Min 8 Karakter)", color: "bg-red-500", percent: "w-1/3" };
    } else if (regPwd.length < 12) {
      return { label: "Sedang", color: "bg-amber-500", percent: "w-2/3" };
    } else {
      return { 
        label: hasMix ? "Kuat & Aman" : "Sedang (Tambahkan Angka/Karakter)", 
        color: hasMix ? "bg-emerald-500" : "bg-amber-500", 
        percent: hasMix ? "w-full" : "w-10/12" 
      };
    }
  };

  const pwdStrength = getPwdStrength();

  // Log in triggers
  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setLoginError("");

    // Validate email
    if (!loginEmail.endsWith(".ac.id")) {
      setLoginError("Gunakan email institusi (.ac.id) Universitas Nurul Fikri");
      return;
    }
    if (!loginPwd) {
      setLoginError("Kata sandi tidak boleh kosong");
      return;
    }

    setLoginLoading(true);

    setTimeout(() => {
      const res = login(loginEmail, loginPwd);
      setLoginLoading(false);
      if (res.success) {
        showToast(`Selamat datang kembali, ${res.user.nama}! 👋`, "success");
        router.replace(`/dashboard/${res.user.role}`);
      } else {
        setLoginError(res.error);
      }
    }, 600);
  };

  // Quick Demo Auto Fill loggers
  const quickLogin = (demoUser) => {
    setLoginEmail(demoUser.email);
    setLoginPwd(demoUser.password);
    
    // Auto submit instantly with short timeout to let state trigger
    setLoginLoading(true);
    setTimeout(() => {
      const res = login(demoUser.email, demoUser.password);
      setLoginLoading(false);
      if (res.success) {
        showToast(`Masuk testing sebagai ${demoUser.namaLengkap} 👋`, "success");
        router.replace(`/dashboard/${demoUser.role}`);
      } else {
        setLoginError(res.error);
      }
    }, 300);
  };

  // Register handlers
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    if (!regNama.trim()) errors.nama = "Nama lengkap wajib diisi";
    if (!regEmail.endsWith(".ac.id")) errors.email = "Gunakan email institusi (.ac.id)";
    if (!regRole) errors.role = "Pilih role akun Anda";
    if (regPwd.length < 8) errors.password = "Kata sandi minimal 8 karakter";
    if (regPwd !== regConfirmPwd) errors.confirm = "Konfirmasi kata sandi tidak cocok";
    if (!regAgreed) errors.agree = "Anda harus menyetujui syarat & ketentuan";

    setRegErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast("Terdapat kesalahan input dalam formulir", "error");
      return;
    }

    setRegLoading(true);

    setTimeout(() => {
      const res = register({
        namaLengkap: regNama,
        email: regEmail,
        password: regPwd,
        role: regRole,
        nimNip: regNimNip,
      });

      setRegLoading(false);

      if (res.success) {
        showToast("Akun berhasil dibuat! Silakan masuk.", "success");
        // Clear registration
        setRegNama("");
        setRegEmail("");
        setRegNimNip("");
        setRegRole("");
        setRegPwd("");
        setRegConfirmPwd("");
        setRegAgreed(false);
        // Switch tab after 1s delay
        setTimeout(() => {
          setActiveTab("login");
          setLoginEmail(regEmail);
        }, 1000);
      } else {
        showToast(res.error, "error");
        setRegErrors({ email: res.error });
      }
    }, 800);
  };

  const handleSsoClick = () => {
    showToast("Login Single Sign-On (SSO) belum tersedia di versi ini.", "info");
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] w-full flex flex-col md:flex-row font-sans overflow-x-hidden" id="login-layout-root">
      
      {/* LEFT COLUMN: BRANDING AND ILLUSTRATION (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1a56db] to-[#1e40af] p-12 items-center justify-center text-white flex-col gap-8 select-none">
        <div className="max-w-md flex flex-col items-start gap-4">
          <div className="bg-[#f59e0b] p-3 rounded-2xl shadow-lg shadow-black/10 text-white">
            <GraduationCap className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-none text-white mt-2">
            EventHub Kampus
          </h2>
          <p className="text-[#f59e0b] font-bold text-sm uppercase tracking-wider">
            Universitas Nurul Fikri
          </p>
          <div className="w-16 h-1 bg-[#f59e0b] rounded-full my-1" />
          <p className="text-white/80 leading-relaxed text-sm pt-2">
            Portal terpadu untuk pendaftaran agenda seminar, workshop, dan kompetisi. Dilengkapi dengan scan presensi QR-code mandiri, pengelolaan kepanitiaan, serta persetujuan sertifikat digital instan.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN FORMS PORT PORTAL */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 min-h-screen">
        <div className="max-w-[440px] w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Mobile Header Branding */}
          <div className="flex flex-col items-center text-center gap-2 mb-6 md:mb-8 select-none">
            <div className="bg-blue-600 p-2 rounded-xl text-white md:hidden">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#1a56db] tracking-tight leading-none md:hidden">
              EventHub STT-NF
            </h2>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none hidden md:block">
              Selamat Datang
            </h2>
            <p className="text-xs text-slate-500 tracking-wide">
              Event & Kepanitiaan Universitas Nurul Fikri
            </p>
          </div>

          {/* TAB HEADERS */}
          <div className="grid grid-cols-2 border-b border-slate-100 mb-6 font-semibold text-sm">
            <button
              onClick={() => setActiveTab("login")}
              className={`pb-3 text-center transition-all cursor-pointer ${
                activeTab === "login" 
                  ? "border-b-3 border-[#1a56db] text-[#1a56db] font-bold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
              id="tab-btn-masuk"
            >
              Masuk
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`pb-3 text-center transition-all cursor-pointer ${
                activeTab === "register" 
                  ? "border-b-3 border-[#1a56db] text-[#1a56db] font-bold" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
              id="tab-btn-daftar"
            >
              Daftar Akun
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === "login" ? (
            <div className="animate-fade-in duration-200">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="bg-red-50 border border-red-150 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-950 font-medium">
                    <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Email input */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-xs font-bold text-slate-700 tracking-tight block">
                    Email Institusi (.ac.id)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      placeholder="mahasiswa@nurulfikri.ac.id"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-3 pl-10 pr-4 rounded-xl outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="login-pwd" className="text-xs font-bold text-slate-700 tracking-tight">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[10px] text-[#1a56db] font-bold hover:underline cursor-pointer"
                      id="btn-forgot-password"
                    >
                      Lupa Kata Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-pwd"
                      type={showPwd ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi Anda"
                      value={loginPwd}
                      onChange={(e) => setLoginPwd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-3 pl-10 pr-10 rounded-xl outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-[#1a56db] hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-sm py-3.5 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center shadow-xs"
                  id="btn-login-submit"
                >
                  {loginLoading ? "Memproses..." : "Masuk Sekarang →"}
                </button>
              </form>

              {/* SSO Divider */}
              <div className="relative py-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  ATAU MASUK DENGAN
                </span>
              </div>

              {/* SSO Logins */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSsoClick}
                  className="border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-[11px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Google Kampus
                </button>
                <button
                  type="button"
                  onClick={handleSsoClick}
                  className="border border-slate-250 hover:bg-slate-50 text-slate-700 font-bold text-[11px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Outlook Kampus
                </button>
              </div>

              {/* TESTING DEMO ACCOUNTS DRAWER */}
              <div className="border border-amber-250/30 bg-amber-500/5 rounded-2xl p-3.5 mt-5 space-y-2">
                <button
                  onClick={() => setDemoOpen(!demoOpen)}
                  className="w-full font-bold text-xs text-amber-800 hover:text-amber-900 flex justify-between items-center cursor-pointer py-1"
                  id="btn-toggle-demo"
                  type="button"
                >
                  <span className="flex items-center gap-1.5">
                    ✦ Akun Demo Pengujian (Sekali Klik)
                  </span>
                  {demoOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {demoOpen && (
                  <div className="grid grid-cols-2 gap-2 pt-2 animate-slide-in">
                    {DEMO_ACCOUNTS.map((demo) => {
                      // Color schemes depending on role
                      const tags = {
                        po: "border-blue-200 bg-blue-50 text-blue-900",
                        panitia: "border-purple-200 bg-purple-50 text-purple-900",
                        mahasiswa: "border-emerald-200 bg-emerald-50 text-emerald-900",
                        staf: "border-rose-200 bg-rose-50 text-rose-900",
                      };
                      return (
                        <button
                          key={demo.id}
                          onClick={() => quickLogin(demo)}
                          className={`border text-left p-2.5 rounded-xl transition-all cursor-pointer hover:shadow-xs active:scale-95 ${tags[demo.role]}`}
                          id={`demo-user-${demo.role}`}
                        >
                          <p className="font-extrabold text-[10px] leading-tight mb-0.5">{demo.namaLengkap}</p>
                          <p className="text-[9px] text-slate-500 truncate mb-1">{demo.email}</p>
                          <span className="inline-block text-[8px] uppercase tracking-widest font-black text-slate-400">
                            PWD: {demo.password}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: REGISTER */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in duration-200">
              
              {/* Nama input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-nama" className="text-xs font-bold text-slate-700 tracking-tight block">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-nama"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    className={`w-full bg-slate-50 border hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-2.5 pl-10 pr-4 rounded-xl outline-none transition-all duration-200 ${
                      regErrors.nama ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
                    }`}
                  />
                </div>
                {regErrors.nama && <span className="text-[10px] text-[#ef4444] font-medium block">{regErrors.nama}</span>}
              </div>

              {/* Email input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-xs font-bold text-slate-700 tracking-tight block">
                  Email Institusi (.ac.id)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="nama@nurulfikri.ac.id"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className={`w-full bg-slate-50 border hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-2.5 pl-10 pr-4 rounded-xl outline-none transition-all duration-200 ${
                      regErrors.email ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
                    }`}
                  />
                </div>
                {regErrors.email && <span className="text-[10px] text-[#ef4444] font-medium block">{regErrors.email}</span>}
              </div>

              {/* NIM / NIP input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-nimnip" className="text-xs font-bold text-slate-700 tracking-tight block">
                  NIM / NIP <span className="text-[10px] text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-nimnip"
                    type="text"
                    placeholder="Contoh: 2021001 atau STF01"
                    value={regNimNip}
                    onChange={(e) => setRegNimNip(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-2.5 pl-10 pr-4 rounded-xl outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Role Select input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-role" className="text-xs font-bold text-slate-700 tracking-tight block">
                  Role Keanggotan
                </label>
                <select
                  id="reg-role"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className={`w-full bg-slate-50 border hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-2.5 px-3.5 rounded-xl outline-none transition-all duration-200 cursor-pointer ${
                    regErrors.role ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
                  }`}
                >
                  <option value="">Pilih Role Akun...</option>
                  <option value="mahasiswa">Mahasiswa (Kepanitiaan & Peserta)</option>
                  <option value="staf">Staf Kemahasiswaan</option>
                </select>
                {regErrors.role && <span className="text-[10px] text-[#ef4444] font-medium block">{regErrors.role}</span>}
              </div>

              {/* Password inputs */}
              <div className="space-y-1.5">
                <label htmlFor="reg-pwd" className="text-xs font-bold text-slate-700 tracking-tight block">
                  Kata Sandi (Min 8 Karakter)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-pwd"
                    type={showRegPwd ? "text" : "password"}
                    placeholder="Buat kata sandi minimal 8 huruf"
                    value={regPwd}
                    onChange={(e) => setRegPwd(e.target.value)}
                    className={`w-full bg-slate-50 border hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-2.5 pl-10 pr-10 rounded-xl outline-none transition-all duration-200 ${
                      regErrors.password ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPwd(!showRegPwd)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showRegPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regPwd && (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${pwdStrength.color} ${pwdStrength.percent}`} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 block">Kekuatan: {pwdStrength.label}</span>
                  </div>
                )}
                {regErrors.password && <span className="text-[10px] text-[#ef4444] font-medium block">{regErrors.password}</span>}
              </div>

              {/* Confirm Password input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-confirm" className="text-xs font-bold text-slate-700 tracking-tight block">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-confirm"
                    type={showRegConfirmPwd ? "text" : "password"}
                    placeholder="Tulis ulang kata sandi diatas"
                    value={regConfirmPwd}
                    onChange={(e) => setRegConfirmPwd(e.target.value)}
                    className={`w-full bg-slate-50 border hover:border-slate-300 focus:border-[#1a56db] focus:bg-white focus:ring-2 focus:ring-blue-150 text-slate-800 text-sm py-2.5 pl-10 pr-10 rounded-xl outline-none transition-all duration-200 ${
                      regErrors.confirm ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPwd(!showRegConfirmPwd)}
                    className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showRegConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regErrors.confirm && <span className="text-[10px] text-[#ef4444] font-medium block">{regErrors.confirm}</span>}
              </div>

              {/* T&C Checkbox */}
              <div className="space-y-1 flex items-start gap-2 pt-1">
                <input
                  id="reg-agreed"
                  type="checkbox"
                  checked={regAgreed}
                  onChange={(e) => setRegAgreed(e.target.checked)}
                  className="w-4 h-4 text-[#1a56db] focus:ring-blue-150 border-slate-300 rounded-md mt-0.5 cursor-pointer"
                />
                <label htmlFor="reg-agreed" className="text-[11px] text-slate-500 font-medium leading-none cursor-pointer select-none">
                  Saya setuju dengan syarat & ketentuan penggunaan platform EventHub Kampas.
                </label>
              </div>
              {regErrors.agree && <span className="text-[10px] text-[#ef4444] font-medium block mt-0.5">{regErrors.agree}</span>}

              {/* Registration process button */}
              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-[#1a56db] hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-sm py-3 px-4 rounded-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center pt-3 mt-4"
                id="btn-register-submit"
              >
                {regLoading ? "Memproses..." : "Daftar Sekarang →"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* LUPA PASSWORD MODAL VIEW */}
      <Modal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
        title="Lupa Kata Sandi?"
      >
        <div className="flex flex-col items-center text-center p-2 gap-4">
          <div className="p-3 bg-blue-50 text-[#1a56db] rounded-2xl border border-blue-100">
            <GraduationCap className="w-10 h-10" />
          </div>
          <p className="font-semibold text-slate-800 text-sm">
            Hubungi admin kemahasiswaan Universitas Nurul Fikri
          </p>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Untuk keperluan reset kredensial, harap mengirimkan dokumen resmi bukti mahasiswa aktif atau surat penugasan kerja bagi panitia/staf ke email resmi sekretariat kemahasiswaan: <strong className="text-slate-800">staff@nurulfikri.ac.id</strong>
          </p>
          <button
            onClick={() => setShowForgotPassword(false)}
            className="w-full bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer mt-2"
          >
            Mengerti & Tutup
          </button>
        </div>
      </Modal>
    </main>
  );
}
