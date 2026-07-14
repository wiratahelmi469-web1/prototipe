"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { User, Phone, FileText, Compass, Award, Calendar, RefreshCw, Save, Users, Building, TrendingUp } from "lucide-react";
import Toast, { ToastContainer } from "../../../../components/Toast";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";

interface ProfileData {
  name: string;
  phone: string;
  nim_nip: string;
  faculty: string;
  bio: string;
}

export default function StaffProfilePage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nip, setNip] = useState("");
  const [division, setDivision] = useState("");
  const [bio, setBio] = useState("");

  // Statistics state
  const [statsMahasiswaTerdaftar, setStatsMahasiswaTerdaftar] = useState(1);
  const [statsEventTerpublikasi, setStatsEventTerpublikasi] = useState(0);

  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "staff") {
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
        setNip(parsed.nim_nip || "");
        setDivision(parsed.faculty || "");
        setBio(parsed.bio || "");
      } catch (e) {
        setName(user.name || "");
        setDivision("Unit Kegiatan Mahasiswa");
      }
    } else {
      setName(user.name || "");
      setDivision("Unit Kegiatan Mahasiswa");
    }

    // Load statistics
    // 1. Mahasiswa Terdaftar (read eventhub_registered_users)
    const savedRegUsers = localStorage.getItem("eventhub_registered_users");
    if (savedRegUsers) {
      try {
        const parsedUsers = JSON.parse(savedRegUsers);
        if (Array.isArray(parsedUsers)) {
          const mhsCount = parsedUsers.filter((u: any) => u.role === "mahasiswa").length;
          setStatsMahasiswaTerdaftar(Math.max(1, mhsCount));
        }
      } catch (e) {}
    } else {
      // Default fallback
      setStatsMahasiswaTerdaftar(3); // Demo baseline
    }

    // 2. Event Terpublikasi
    const savedEvents = localStorage.getItem("eventhub_events");
    let currentEvents: EventItem[] = [];
    if (savedEvents) {
      try {
        currentEvents = JSON.parse(savedEvents);
      } catch (e) {
        currentEvents = INITIAL_EVENTS;
      }
    } else {
      currentEvents = INITIAL_EVENTS;
    }
    const published = currentEvents.filter((e) => e.status !== "Pending Approval");
    setStatsEventTerpublikasi(published.length);

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
      nim_nip: nip.trim(),
      faculty: division.trim(),
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
        setNip(parsed.nim_nip || "");
        setDivision(parsed.faculty || "");
        setBio(parsed.bio || "");
      } catch (e) {}
    } else {
      setName(user.name || "");
      setPhone("");
      setNip("");
      setDivision("Unit Kegiatan Mahasiswa");
      setBio("");
    }
    addToast("Formulir isian di-reset ke data terakhir.", "info");
  };

  if (loading || !user) return null;

  const avatarInitial = name ? name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase();

  return (
    <Workspace id="staff_profile_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6" id="staff_profile_refined_viewport">
        {/* Header Title section */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Kelola Profil Administrasi Kampus</h2>
          <p className="text-xs text-stone-500 mt-1">
            Ulas data administrasi organisasi, kontrol hak akses, serta kelola profil Staf Kemahasiswaan Anda.
          </p>
        </div>

        {/* Group Columns (Card & Stats side is grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main profile edit form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Form Container */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-xs">
              
              {/* BAGIAN 1 - Header Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 mb-6 border-b border-stone-100">
                <div className="w-24 h-24 rounded-full bg-navy-tint text-navy flex items-center justify-center font-extrabold text-3xl uppercase shadow-inner border border-navy-light/10 shrink-0">
                  {avatarInitial}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="font-black text-xl text-stone-900 tracking-tight">{name || user.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-navy-tint text-navy px-3 py-0.5 rounded-full border border-navy-light/10 self-center font-semibold">
                      Staff Kemahasiswaan
                    </span>
                  </div>
                  <p className="text-xs font-mono text-stone-500">{user.email}</p>
                  <p className="text-xs font-mono font-bold text-stone-400">
                    NIP: {nip || "—"}
                  </p>
                </div>
              </div>

              {/* BAGIAN 2 - Form Edit Profil */}
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="staff_profile_name" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                      <input
                        id="staff_profile_name"
                        type="text"
                        required
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-navy focus:bg-white transition-all font-semibold text-stone-850"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="staff_profile_phone" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor HP</label>
                    <div className="relative">
                      <input
                        id="staff_profile_phone"
                        type="text"
                        placeholder="08xxxxxxxxxx"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-navy focus:bg-white transition-all font-semibold text-stone-850"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="staff_profile_nip" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor Induk Staf (NIP)</label>
                    <div className="relative">
                      <input
                        id="staff_profile_nip"
                        type="text"
                        placeholder="Masukkan NIP Staf"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-navy focus:bg-white transition-all font-semibold text-stone-850"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="staff_profile_faculty" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Mutu / Divisi Kerja</label>
                    <div className="relative">
                      <input
                        id="staff_profile_faculty"
                        type="text"
                        placeholder="Contoh: Unit Kegiatan Mahasiswa"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-navy focus:bg-white transition-all font-semibold text-stone-850"
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
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
                    <label htmlFor="staff_profile_bio" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Bio / Tentang Saya</label>
                    <span className="text-[10px] text-stone-400 font-mono font-bold">
                      {Math.min(200, bio.length)}/200
                    </span>
                  </div>
                  <textarea
                    id="staff_profile_bio"
                    maxLength={200}
                    placeholder="Tulis biografi ringkas layanan administrasi Anda..."
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 min-h-[80px] max-h-[140px] outline-hidden focus:border-navy focus:bg-white transition-all font-semibold text-stone-850 leading-relaxed"
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
                    id="reset_staff_profile_btn"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-navy hover:bg-navy-mid text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    id="save_staff_profile_btn"
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
            <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">MONITORING KAMPUS</h4>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-navy-tint text-navy flex items-center justify-center border border-navy-light/10 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Mahasiswa Terdaftar</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsMahasiswaTerdaftar}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-navy-tint text-navy flex items-center justify-center border border-navy-light/10 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Event Terpublikasi</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsEventTerpublikasi}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Akumulasi SKKM</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">18 SKKM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
