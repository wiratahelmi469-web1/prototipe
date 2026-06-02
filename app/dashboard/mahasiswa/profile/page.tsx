"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { User, Phone, FileText, Compass, Award, Calendar, RefreshCw, Save } from "lucide-react";
import Toast, { ToastContainer } from "../../../../components/Toast";
import { INITIAL_CERTIFICATES, UserCertificate } from "../../../../lib/certificateData";

interface ProfileData {
  name: string;
  phone: string;
  nim_nip: string;
  faculty: string;
  bio: string;
}

export default function MahasiswaProfilePage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nim, setNim] = useState("");
  const [prodi, setProdi] = useState("");
  const [bio, setBio] = useState("");

  // Statistics state
  const [statsEventDiikuti, setStatsEventDiikuti] = useState(0);
  const [statsSertifikatSiap, setStatsSertifikatSiap] = useState(0);

  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "mahasiswa") {
      router.push("/login");
      return;
    }

    // Load Profile from localStorage
    const profileKey = `eventhub_profile_${user.email}`;
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      try {
        const parsed: ProfileData = JSON.parse(savedProfile);
        setName(parsed.name || user.name || "");
        setPhone(parsed.phone || "");
        setNim(parsed.nim_nip || "");
        setProdi(parsed.faculty || "");
        setBio(parsed.bio || "");
      } catch (e) {
        // Fallback
        setName(user.name || "");
        setProdi("Teknik Informatika");
      }
    } else {
      // Fallback defaults
      setName(user.name || "");
      setProdi("Teknik Informatika");
    }

    // Load statistics
    // 1. Events Diikuti
    const registeredKey = `registered_${user.email}_events`;
    const savedRegs = localStorage.getItem(registeredKey);
    if (savedRegs) {
      try {
        const parsedList = JSON.parse(savedRegs);
        if (Array.isArray(parsedList)) {
          setStatsEventDiikuti(parsedList.length);
        }
      } catch (e) {}
    }

    // 2. Sertifikat Siap
    const savedCerts = localStorage.getItem("eventhub_certs");
    let certsList: UserCertificate[] = [];
    if (savedCerts) {
      try {
        certsList = JSON.parse(savedCerts);
      } catch (e) {
        certsList = INITIAL_CERTIFICATES;
      }
    } else {
      certsList = INITIAL_CERTIFICATES;
    }
    const filteredCerts = certsList.filter(
      (c) => c.isDistributed === true && c.userEmail === user.email
    );
    setStatsSertifikatSiap(filteredCerts.length);

  }, [user, loading, router]);

  const addToast = (message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      addToast("Nama lengkap tidak boleh kosong.", "error");
      return;
    }

    const updatedProfile: ProfileData = {
      name: name.trim(),
      phone: phone.trim(),
      nim_nip: nim.trim(),
      faculty: prodi.trim(),
      bio: bio.trim(),
    };

    localStorage.setItem(`eventhub_profile_${user.email}`, JSON.stringify(updatedProfile));
    
    // Sync session user name representation as well
    await login(user.email, user.role, name.trim());

    addToast("Profil berhasil diperbarui!", "success");
  };

  const handleReset = () => {
    if (!user) return;
    const profileKey = `eventhub_profile_${user.email}`;
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      try {
        const parsed: ProfileData = JSON.parse(savedProfile);
        setName(parsed.name || user.name || "");
        setPhone(parsed.phone || "");
        setNim(parsed.nim_nip || "");
        setProdi(parsed.faculty || "");
        setBio(parsed.bio || "");
      } catch (e) {}
    } else {
      setName(user.name || "");
      setPhone("");
      setNim("");
      setProdi("Teknik Informatika");
      setBio("");
    }
    addToast("Formulir isian di-reset ke data terakhir.", "info");
  };

  if (loading || !user) return null;

  const avatarInitial = name ? name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase();

  return (
    <Workspace id="mahasiswa_profile_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6" id="mhs_profile_refined_viewport">
        {/* Header Title section */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Kelola Profil Mahasiswa</h2>
          <p className="text-xs text-stone-500 mt-1">
            Pantau statistik partisipasi Anda dan lengkapi biodata e-sertifikat berstandar kampus.
          </p>
        </div>

        {/* Group Columns (Card & Stats side is grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile edit form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form Container */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-xs">
              
              {/* BAGIAN 1 - Header Avatar (integrated inside editor) */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 mb-6 border-b border-stone-100">
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-3xl uppercase shadow-inner border border-indigo-200 shrink-0">
                  {avatarInitial}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="font-black text-xl text-stone-900 tracking-tight">{name || user.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-3 py-0.5 rounded-full border border-indigo-200 self-center">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-stone-500">{user.email}</p>
                  <p className="text-xs font-mono font-bold text-stone-400">
                    NIM: {nim || "—"}
                  </p>
                </div>
              </div>

              {/* BAGIAN 2 - Form Edit Profil */}
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mhs_profile_name" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                      <input
                        id="mhs_profile_name"
                        type="text"
                        required
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mhs_profile_phone" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor HP</label>
                    <div className="relative">
                      <input
                        id="mhs_profile_phone"
                        type="text"
                        placeholder="08xxxxxxxxxx"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mhs_profile_nim" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor Induk Mahasiswa (NIM)</label>
                    <div className="relative">
                      <input
                        id="mhs_profile_nim"
                        type="text"
                        placeholder="Masukkan NIM lengkap"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850"
                        value={nim}
                        onChange={(e) => setNim(e.target.value)}
                      />
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mhs_profile_faculty" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Program Studi / Fakultas</label>
                    <div className="relative">
                      <input
                        id="mhs_profile_faculty"
                        type="text"
                        placeholder="Contoh: Teknik Informatika"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850"
                        value={prodi}
                        onChange={(e) => setProdi(e.target.value)}
                      />
                      <Compass className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                </div>

                {/* Read Only segment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50/50 p-4 border border-stone-150 rounded-xl">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Email (Read Only)</label>
                    <div className="text-xs font-semibold text-stone-500 py-1 font-mono">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">Peran Akses (Read Only)</label>
                    <div className="text-xs font-semibold text-stone-500 py-1 capitalize">{user.role}</div>
                  </div>
                </div>

                {/* Bio text area */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="mhs_profile_bio" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Bio / Tentang Saya</label>
                    <span className="text-[10px] text-stone-400 font-mono font-bold">
                      {Math.min(200, bio.length)}/200
                    </span>
                  </div>
                  <textarea
                    id="mhs_profile_bio"
                    maxLength={200}
                    placeholder="Tulis biografi singkat atau keahlian akademis kamu..."
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 min-h-[80px] max-h-[140px] outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850 leading-relaxed"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {/* Submit buttons */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    id="reset_mhs_profile_btn"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    id="save_mhs_profile_btn"
                  >
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* BAGIAN 3 - Statistik Ringkas (cards) as sidebar column */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">STATISTIK PARTISIPASI</h4>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Event Diikuti</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsEventDiikuti}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Sertifikat Siap</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsSertifikatSiap}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Program Studi</span>
                <span className="text-xs font-black text-stone-850 truncate max-w-[160px] block mt-0.5">{prodi || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
