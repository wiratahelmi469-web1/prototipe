"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import { User, Phone, FileText, Compass, Award, Calendar, RefreshCw, Save, ShieldCheck, Hourglass } from "lucide-react";
import Toast, { ToastContainer } from "../../../../components/Toast";
import { INITIAL_EVENTS, EventItem } from "../../../../lib/mockData";
import { INITIAL_CERTIFICATES, UserCertificate } from "../../../../lib/certificateData";

interface ProfileData {
  name: string;
  phone: string;
  nim_nip: string;
  faculty: string;
  bio: string;
}

export default function POProfilePage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nip, setNip] = useState("");
  const [division, setDivision] = useState("");
  const [bio, setBio] = useState("");

  // Statistics state
  const [statsEventDisetujui, setStatsEventDisetujui] = useState(0);
  const [statsMenungguApproval, setStatsMenungguApproval] = useState(0);
  const [statsSertifikatDivalidasi, setStatsSertifikatDivalidasi] = useState(0);

  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "po") {
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
        setDivision("Bidang Kemahasiswaan");
      }
    } else {
      setName(user.name || "");
      setDivision("Bidang Kemahasiswaan");
    }

    // Load statistics
    // 1. Events disetujui & menunggu approval
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
    const approved = currentEvents.filter((e) => e.status !== "Pending Approval");
    const pending = currentEvents.filter((e) => e.status === "Pending Approval");
    setStatsEventDisetujui(approved.length);
    setStatsMenungguApproval(pending.length);

    // 2. Sertifikat Divalidasi
    const savedCerts = localStorage.getItem("eventhub_certs");
    let currentCerts: UserCertificate[] = [];
    if (savedCerts) {
      try {
        currentCerts = JSON.parse(savedCerts);
      } catch (e) {
        currentCerts = INITIAL_CERTIFICATES;
      }
    } else {
      currentCerts = INITIAL_CERTIFICATES;
    }
    const validated = currentCerts.filter((c) => c.isApprovedByPO === true);
    setStatsSertifikatDivalidasi(validated.length);

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
      setDivision("Bidang Kemahasiswaan");
      setBio("");
    }
    addToast("Formulir isian di-reset ke data terakhir.", "info");
  };

  if (loading || !user) return null;

  const avatarInitial = name ? name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase();

  return (
    <Workspace id="po_profile_workspace">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto space-y-6" id="po_profile_refined_viewport">
        {/* Header Title section */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">Kelola Profil Project Owner (PO)</h2>
          <p className="text-xs text-stone-500 mt-1">
            Pantau status approval and kelola profil verifikasi tanda tangan digital resmi dewan kampus.
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
                <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-3xl uppercase shadow-inner border border-emerald-200 shrink-0">
                  {avatarInitial}
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="font-black text-xl text-stone-900 tracking-tight">{name || user.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full border border-emerald-200 self-center">
                      PO (Project Owner)
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
                    <label htmlFor="po_profile_name" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nama Lengkap</label>
                    <div className="relative">
                      <input
                        id="po_profile_name"
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
                    <label htmlFor="po_profile_phone" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor HP</label>
                    <div className="relative">
                      <input
                        id="po_profile_phone"
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
                    <label htmlFor="po_profile_nip" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Nomor Induk Pegawai (NIP)</label>
                    <div className="relative">
                      <input
                        id="po_profile_nip"
                        type="text"
                        placeholder="Masukkan NIP Resmi"
                        className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-semibold text-stone-850"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                      />
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="po_profile_faculty" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1.5">Unit Kerja / Divisi</label>
                    <div className="relative">
                      <input
                        id="po_profile_faculty"
                        type="text"
                        placeholder="Contoh: Bidang Kemahasiswaan"
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
                    <label htmlFor="po_profile_bio" className="block text-[10px] font-black uppercase text-stone-400 tracking-wider">Bio / Tentang Saya</label>
                    <span className="text-[10px] text-stone-400 font-mono font-bold">
                      {Math.min(200, bio.length)}/200
                    </span>
                  </div>
                  <textarea
                    id="po_profile_bio"
                    maxLength={200}
                    placeholder="Tulis biografi ringkas atau penugasan dekan kemahasiswaan Anda..."
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
                    id="reset_po_profile_btn"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    id="save_po_profile_btn"
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
            <h4 className="text-[10px] font-black uppercase text-stone-400 tracking-wider">PENILAIAN &amp; KINERJA</h4>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Event Disetujui</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsEventDisetujui}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                <Hourglass className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Menunggu Approval</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsMenungguApproval}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wide block">Sertifikat Divalidasi</span>
                <span className="text-lg font-black text-stone-900 font-mono block leading-none">{statsSertifikatDivalidasi}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
