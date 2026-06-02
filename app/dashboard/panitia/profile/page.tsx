"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { User, Phone, FileText, Compass, Award, Calendar, RefreshCw, Save, CheckSquare } from "lucide-react";
import Toast, { ToastContainer } from "../../../../components/Toast";
import { INITIAL_EVENTS, INITIAL_TASKS, EventItem, TaskItem } from "../../../../lib/mockData";

interface ProfileData {
  name: string;
  phone: string;
  nim_nip: string;
  faculty: string;
  bio: string;
}

export default function PanitiaProfilePage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nip, setNip] = useState("");
  const [division, setDivision] = useState("");
  const [bio, setBio] = useState("");

  // Statistics state
  const [statsEventAktif, setStatsEventAktif] = useState(0);
  const [statsTugasSelesai, setStatsTugasSelesai] = useState(0);
  const [statsTotalPeserta, setStatsTotalPeserta] = useState(0);

  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "panitia") {
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
        setDivision("Divisi Acara");
      }
    } else {
      setName(user.name || "");
      setDivision("Divisi Acara");
    }

    // Load statistics
    // 1. Event Aktif
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
    const activeEvts = currentEvents.filter(
      (e) => e.status !== "Selesai" && e.status !== "Pending Approval"
    );
    setStatsEventAktif(activeEvts.length);

    // 2. Tugas Selesai
    const savedTasks = localStorage.getItem("eventhub_tasks");
    let currentTasks: TaskItem[] = [];
    if (savedTasks) {
      try {
        currentTasks = JSON.parse(savedTasks);
      } catch (e) {
        currentTasks = INITIAL_TASKS;
      }
    } else {
      currentTasks = INITIAL_TASKS;
    }
    const completedTasks = currentTasks.filter((t) => t.status === "done");
    setStatsTugasSelesai(completedTasks.length);

    // 3. Total Peserta
    const totalP = currentEvents.reduce((acc, curr) => acc + (curr.pesertaCount || 0), 0);
    setStatsTotalPeserta(totalP);

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
      setDivision("Divisi Acara");
      setBio("");
    }
    addToast("Formulir isian di-reset ke data terakhir.", "info");
  };

  if (loading || !user) return null;

  const avatarInitial = name ? name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase();

  return (
    <Workspace id="panitia_profile_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6" id="panitia_profile_refined_viewport">
        {/* Header Title section */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Kelola Profil Panitia</h2>
          <p className="text-xs text-stone-500 mt-1">
            Pantau performa penugasan kepanitiaan Anda dan lengkapi identitas kepengurusan organisasi.
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
                <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-3xl uppercase shadow-inner border border-blue-200 shrink-0">
                  {avatarInitial}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="font-black text-xl text-stone-900 tracking-tight">{name || user.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full border border-blue-200 self-center">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-stone-500">{user.email}</p>
                  <p className="text-xs font-mono font-bold text-stone-400">
                    NIM: {nip || "—"}
                  </p>
                </div>
              </div>

              {/* BAGIAN 2 - Form Edit Profil */}
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="panitia_profile_name" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                      <input
                        id="panitia_profile_name"
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
                    <label htmlFor="panitia_profile_phone" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor HP</label>
                    <div className="relative">
                      <input
                        id="panitia_profile_phone"
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
                    <label htmlFor="panitia_profile_nim" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor Induk Mahasiswa (NIM)</label>
                    <div className="relative">
                      <input
                        id="panitia_profile_nim"
                        type="text"
                        placeholder="NIM Mahasiswa"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="panitia_profile_div" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Fakultas / Divisi Kerja</label>
                    <div className="relative">
                      <input
                        id="panitia_profile_div"
                        type="text"
                        placeholder="Contoh: Divisi Acara"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850"
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
                    <label htmlFor="panitia_profile_bio" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Bio / Tentang Saya</label>
                    <span className="text-[10px] text-stone-400 font-mono font-bold">
                      {Math.min(200, bio.length)}/200
                    </span>
                  </div>
                  <textarea
                    id="panitia_profile_bio"
                    maxLength={200}
                    placeholder="Tulis keahlian organisasi atau deskripsi ringkas diri Anda..."
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
                    id="reset_panitia_profile_btn"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    id="save_panitia_profile_btn"
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
            <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">PRESTASI KEPANITIAAN</h4>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Event Aktif</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsEventAktif}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Tugas Selesai</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsTugasSelesai}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Total Peserta Dipandu</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsTotalPeserta}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
