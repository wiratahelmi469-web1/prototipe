"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Lock, Hash, Send, ChevronLeft } from "lucide-react";
import { UserSessionData } from "../context/AuthContext";

interface ChatKoordinasiProps {
  user: UserSessionData;
  onClose?: () => void;
}

interface Channel {
  id: string;
  name: string;
  allowedRoles: string[];
  readOnlyRoles?: string[];
}

interface MessageItem {
  id: string;
  channelId: string;
  senderName: string;
  senderEmail: string;
  senderRole: string;
  content: string;
  timestamp: string;
}

const CHANNELS: Channel[] = [
  { id: "pengumuman",        name: "Pengumuman",        allowedRoles: ["mahasiswa","panitia","po","staff"], readOnlyRoles: ["mahasiswa"] },
  { id: "umum",              name: "Umum",              allowedRoles: ["mahasiswa","panitia","po","staff"] },
  { id: "mahasiswa-tanya",   name: "Tanya Jawab Mahasiswa", allowedRoles: ["mahasiswa","panitia","po","staff"] },
  { id: "lintas-divisi",     name: "Lintas Divisi",     allowedRoles: ["panitia","po","staff"] },
  { id: "panitia-internal",  name: "Panitia Internal",  allowedRoles: ["panitia"] },
  { id: "po-koordinasi",     name: "PO Koordinasi",     allowedRoles: ["po"] },
  { id: "staff-kemahasiswaan", name: "Staf Kemahasiswaan", allowedRoles: ["staff-only-internal"] }
];

const INITIAL_MESSAGES: MessageItem[] = [
  // pengumuman
  { id: "msg-1", channelId: "pengumuman", senderName: "Staf Kemahasiswaan", senderEmail: "staff@nurulfikri.ac.id", senderRole: "staff", content: "Selamat datang di EventHub Kampus! Segala pengumuman resmi terkait event ulasan akan dipublikasikan di sini.", timestamp: "2026-06-02T08:00:00.000Z" },
  { id: "msg-2", channelId: "pengumuman", senderName: "Rudi Hartono (PO)", senderEmail: "po@nurulfikri.ac.id", senderRole: "po", content: "Harap semua panitia menyelesaikan logistik sebelum tanggal pelaksanaan masing-masing event.", timestamp: "2026-06-02T08:05:00.000Z" },

  // umum
  { id: "msg-3", channelId: "umum", senderName: "Ahmad Junaidi (Mhs)", senderEmail: "mahasiswa@nurulfikri.ac.id", senderRole: "mahasiswa", content: "Halo teman-teman! Apakah ada rekomendasi seminar yang menarik minggu ini?", timestamp: "2026-06-02T08:10:00.000Z" },
  { id: "msg-4", channelId: "umum", senderName: "Andi Saputra (Panitia)", senderEmail: "panitia@nurulfikri.ac.id", senderRole: "panitia", content: "Ada Seminar Generative AI lho hari Sabtu nanti, buruan daftar ya!", timestamp: "2026-06-02T08:12:00.000Z" },

  // mahasiswa-tanya
  { id: "msg-5", channelId: "mahasiswa-tanya", senderName: "Ahmad Junaidi (Mhs)", senderEmail: "mahasiswa@nurulfikri.ac.id", senderRole: "mahasiswa", content: "Permisi Kak, untuk sertifikat Seminar Generative AI kapan bisa diunduh ya?", timestamp: "2026-06-02T08:15:00.000Z" },
  { id: "msg-6", channelId: "mahasiswa-tanya", senderName: "Andi Saputra (Panitia)", senderEmail: "panitia@nurulfikri.ac.id", senderRole: "panitia", content: "Halo Ahmad, sertifikat akan otomatis terbuka di tab Sertifikasi begitu PO melakukan pengesahan masal ya.", timestamp: "2026-06-02T08:18:00.000Z" },

  // lintas-divisi
  { id: "msg-7", channelId: "lintas-divisi", senderName: "Andi Saputra (Panitia)", senderEmail: "panitia@nurulfikri.ac.id", senderRole: "panitia", content: "Divisi konsumsi apakah sudah memesan makanan untuk pemateri?", timestamp: "2026-06-02T08:20:00.000Z" },
  { id: "msg-8", channelId: "lintas-divisi", senderName: "Rudi Hartono (PO)", senderEmail: "po@nurulfikri.ac.id", senderRole: "po", content: "Sudah saya approve anggarannya kemarin. Tolong dikoordinasikan langsung ya.", timestamp: "2026-06-02T08:22:00.000Z" },

  // panitia-internal
  { id: "msg-9", channelId: "panitia-internal", senderName: "Andi Saputra (Panitia)", senderEmail: "panitia@nurulfikri.ac.id", senderRole: "panitia", content: "Teman-teman panitia, rapat koordinasi rundown akan dimulai pukul 13.00 WIB hari ini di basecamp.", timestamp: "2026-06-02T08:25:00.000Z" },
  { id: "msg-10", channelId: "panitia-internal", senderName: "Siti Rahma", senderEmail: "sitirahma@nurulfikri.ac.id", senderRole: "panitia", content: "Siap Kak! Dokumentasi dan perlengkapan layar proyektor sudah siap.", timestamp: "2026-06-02T08:27:00.000Z" },

  // po-koordinasi
  { id: "msg-11", channelId: "po-koordinasi", senderName: "Rudi Hartono (PO)", senderEmail: "po@nurulfikri.ac.id", senderRole: "po", content: "Laporan proposal untuk Pekan Olahraga Mahasiswa sudah saya submit ke Staf Kemahasiswaan.", timestamp: "2026-06-02T08:30:00.000Z" },
  { id: "msg-12", channelId: "po-koordinasi", senderName: "Rudi Hartono (PO)", senderEmail: "po@nurulfikri.ac.id", senderRole: "po", content: "Semoga bisa langsung disetujui agar pendaftaran peserta segera dibuka.", timestamp: "2026-06-02T08:31:00.000Z" },

  // staff-kemahasiswaan
  { id: "msg-13", channelId: "staff-kemahasiswaan", senderName: "Staf Kemahasiswaan", senderEmail: "staff@nurulfikri.ac.id", senderRole: "staff", content: "Ulasan data e-sertifikat dari PO sejauh ini valid dan sesuai kuota.", timestamp: "2026-06-02T08:35:00.000Z" },
  { id: "msg-14", channelId: "staff-kemahasiswaan", senderName: "Staf Kemahasiswaan", senderEmail: "staff@nurulfikri.ac.id", senderRole: "staff", content: "Tolong ingatkan mahasiswa untuk terus melengkapi profil dan mencantumkan NIM yang benar.", timestamp: "2026-06-02T08:38:00.000Z" }
];

export default function ChatKoordinasi({ user }: ChatKoordinasiProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeChannelId, setActiveChannelId] = useState("umum");
  const [inputValue, setInputValue] = useState("");
  const [mobileView, setMobileView] = useState<"channels" | "chat">("channels");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    setMobileView("chat");
  };

  // Sync with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("eventhub_chat_messages");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (err) {
        setMessages(INITIAL_MESSAGES);
      }
    } else {
      localStorage.setItem("eventhub_chat_messages", JSON.stringify(INITIAL_MESSAGES));
      setMessages(INITIAL_MESSAGES);
    }
  }, []);

  const visibleChannels = useMemo(() => {
    return CHANNELS.filter((c) => c.allowedRoles.includes(user.role));
  }, [user.role]);

  // Adjust active channel if not visible/allowed
  useEffect(() => {
    if (visibleChannels.length > 0 && !visibleChannels.find((c) => c.id === activeChannelId)) {
      setActiveChannelId(visibleChannels[0].id);
    }
  }, [visibleChannels, activeChannelId]);

  // Scroll bottom on select / update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChannelId]);

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId);
  const isReadOnly = activeChannel?.readOnlyRoles?.includes(user.role) || false;

  const currentChannelMessages = messages.filter((m) => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isReadOnly) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      senderName: user.name,
      senderEmail: user.email,
      senderRole: user.role,
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem("eventhub_chat_messages", JSON.stringify(updated));
    setInputValue("");
  };

  return (
    <div className="flex border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs h-[520px] sm:h-[580px] md:h-[620px] transition-all" id="chat_koordinasi_container">
      {/* Sidebar List */}
      <div 
        className={`${
          mobileView === "channels" ? "flex" : "hidden"
        } md:flex w-full md:w-56 bg-stone-900 text-stone-200 flex-col justify-between shrink-0 border-r border-stone-800`} 
        id="chat_sidebar"
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase text-stone-400 tracking-wider font-mono">SALURAN CHAT</h3>
            <span className="md:hidden text-[9px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded font-mono font-bold">
              Kanal
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1" id="channels_list">
            {visibleChannels.map((ch) => {
              const isExclusive = ch.allowedRoles.length === 1;
              const isActive = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => handleChannelClick(ch.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "hover:bg-stone-800/70 text-stone-300"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    {isExclusive ? (
                      <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    ) : (
                      <Hash className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    )}
                    <span className="truncate">{ch.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Info Footing inside Sidebar */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/40 shrink-0" id="chat_sidebar_user_footer">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold text-stone-100 truncate">{user.name}</div>
            <div className="text-[9px] text-stone-500 font-mono truncate">{user.email}</div>
            <div className="mt-1">
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-stone-800 border border-stone-700 text-indigo-400 font-bold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div 
        className={`${
          mobileView === "chat" ? "flex" : "hidden"
        } md:flex flex-1 flex-col bg-stone-50`} 
        id="chat_main_area"
      >
        {/* Header bar */}
        <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 w-full">
            {/* Back to Channels list on mobile */}
            <button
              onClick={() => setMobileView("channels")}
              className="md:hidden p-1.5 hover:bg-stone-100 rounded-xl text-stone-500 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Kembali ke saluran"
            >
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-stone-900 flex items-center gap-1.5 truncate">
                <Hash className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="truncate">{activeChannel?.name}</span>
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-tight truncate">
                {activeChannel?.id === "pengumuman"
                  ? "Informasi penting satu arah untuk seluruh mahasiswa dan kepanitiaan."
                  : `Saluran koordinasi bagi tim: ${activeChannel?.allowedRoles.join(", ")}`}
              </p>
            </div>

            {/* Mobile View Channel List Info Badge */}
            <div className="hidden sm:block md:hidden shrink-0">
              <span className="text-[10px] bg-stone-100 border border-stone-200 text-stone-600 px-2 py-0.5 rounded-lg font-bold font-mono">
                #{activeChannelId}
              </span>
            </div>
          </div>
        </div>

        {/* Message scroll viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat_messages_scroll">
          {currentChannelMessages.length === 0 ? (
            <div className="text-center py-20 text-stone-400 italic text-xs">
              Mulai obrolan baru di saluran #{activeChannel?.name}
            </div>
          ) : (
            currentChannelMessages.map((msg) => {
              const isSelf = msg.senderEmail === user.email || (msg.senderName === user.name && msg.senderRole === user.role);
              
              let badgeBg = "bg-stone-100 text-stone-600 border-stone-200";
              if (msg.senderRole === "po") badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-100";
              else if (msg.senderRole === "panitia") badgeBg = "bg-blue-50 text-blue-700 border-blue-105";
              else if (msg.senderRole === "staff") badgeBg = "bg-purple-50 text-purple-700 border-purple-101";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
                  id={`chat_msg_${msg.id}`}
                >
                  {/* Sender Details */}
                  {!isSelf && (
                    <div className="flex items-center gap-1.5 pb-1">
                      <span className="text-[11px] font-bold text-stone-700">{msg.senderName}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full border font-black uppercase tracking-wider ${badgeBg}`}>
                        {msg.senderRole}
                      </span>
                    </div>
                  )}

                  {/* Text bubble */}
                  <div
                    className={`px-3.5 py-2.5 text-xs font-semibold leading-relaxed shadow-3xs ${
                      isSelf
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none"
                        : "bg-white border border-stone-200 text-stone-850 rounded-2xl rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {/* Timestamp */}
                  <span className="text-[9px] text-stone-400 mt-1 px-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Messaging prompt/bar */}
        <div className="p-4 bg-white border-t border-stone-200 shrink-0">
          {isReadOnly ? (
            <div className="py-2.5 bg-stone-100 rounded-xl text-center text-xs font-semibold text-stone-400 border border-stone-200" id="chat_readonly_banner">
              Anda hanya bisa membaca channel ini
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2" id="chat_input_form">
              <input
                type="text"
                placeholder={`Tulis pesan ke #${activeChannel?.name}...`}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-stone-800 placeholder-stone-400"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                id="chat_send_button"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
