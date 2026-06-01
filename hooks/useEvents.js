// SECTION: Events Database Controller Hook
"use client";

import { useState, useEffect } from "react";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/localStorage";
import { DUMMY_EVENTS } from "@/lib/constants";

// Helper function declared outside hook context to maintain React purity
const makeUniqueEventId = () => {
  return "EVT-" + Date.now();
};

export default function useEvents() {
  const [events, setEvents] = useState(() => {
    const saved = getLocalStorageItem("events", null);
    if (!saved) {
      return DUMMY_EVENTS;
    }
    return saved;
  });

  useEffect(() => {
    // Sync storage fallback write
    const saved = getLocalStorageItem("events", null);
    if (!saved) {
      setLocalStorageItem("events", DUMMY_EVENTS);
    }
  }, []);

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    setLocalStorageItem("events", newEvents);

    // Dispatch custom event to notify other mounted components in real-time
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("events-updated"));
    }
  };

  // Re-sync listener
  useEffect(() => {
    const handleSync = () => {
      setEvents(getLocalStorageItem("events", []));
    };
    window.addEventListener("events-updated", handleSync);
    return () => window.removeEventListener("events-updated", handleSync);
  }, []);

  const addEvent = (eventData, creatorEmail) => {
    const newEvent = {
      id: makeUniqueEventId(),
      nama: eventData.nama,
      kategori: eventData.kategori,
      tanggal: eventData.tanggal,
      jam: eventData.jam,
      lokasi: eventData.lokasi,
      penyelenggara: eventData.penyelenggara,
      pengajuEmail: creatorEmail,
      kuotaMax: parseInt(eventData.kuotaMax) || 100,
      kuotaTerisi: 0,
      status: "pending_approval",
      eventStatus: "segera",
      tanggalDiajukan: new Date().toISOString().split("T")[0],
      deskripsi: eventData.deskripsi,
      sertifikatStatus: null,
      peserta: [],
    };

    const updatedEvents = [newEvent, ...events];
    saveEvents(updatedEvents);

    // Create a notification for PO
    addNotification({
      title: "Pengajuan Event Baru",
      message: `Event "${eventData.nama}" baru saja diajukan oleh ${eventData.penyelenggara}.`,
      role: "po",
      type: "pending_approval",
    });

    return newEvent;
  };

  const updateEvent = (eventId, updatedFields) => {
    const updatedEvents = events.map((evt) => {
      if (evt.id === eventId) {
        return { ...evt, ...updatedFields };
      }
      return evt;
    });
    saveEvents(updatedEvents);
  };

  const rsvpEvent = (eventId, currentUser) => {
    let success = false;
    let errorMsg = "";

    const updatedEvents = events.map((evt) => {
      if (evt.id === eventId) {
        if (evt.kuotaTerisi >= evt.kuotaMax) {
          errorMsg = "Maaf, kuota pendaftaran event ini sudah penuh.";
          return evt;
        }

        const isAlreadyRegistered = evt.peserta.some((p) => p.email === currentUser.email);
        if (isAlreadyRegistered) {
          errorMsg = "Anda sudah terdaftar di event ini.";
          return evt;
        }

        success = true;
        const updatedPeserta = [
          ...evt.peserta,
          {
            nim: currentUser.nimNip || "GUEST",
            nama: currentUser.nama,
            email: currentUser.email,
            statusHadir: "menunggu",
            jamScan: null,
            nomorSertifikat: `CERT-2026-${evt.id}-${currentUser.nimNip || "GUEST"}`,
            sertifikatDownloaded: false,
          },
        ];

        return {
          ...evt,
          kuotaTerisi: evt.kuotaTerisi + 1,
          peserta: updatedPeserta,
        };
      }
      return evt;
    });

    if (success) {
      saveEvents(updatedEvents);
      // Notify student
      addNotification({
        title: "Pendaftaran Berhasil 🎉",
        message: `Anda berhasil terdaftar di event "${events.find(e => e.id === eventId)?.nama}".`,
        email: currentUser.email,
        type: "success",
      });
      return { success: true };
    }

    return { success: false, error: errorMsg };
  };

  const cancelRsvp = (eventId, userEmail) => {
    let success = false;
    const updatedEvents = events.map((evt) => {
      if (evt.id === eventId) {
        const isRegistered = evt.peserta.some((p) => p.email === userEmail);
        if (!isRegistered) return evt;

        success = true;
        return {
          ...evt,
          kuotaTerisi: Math.max(0, evt.kuotaTerisi - 1),
          peserta: evt.peserta.filter((p) => p.email !== userEmail),
        };
      }
      return evt;
    });

    if (success) {
      saveEvents(updatedEvents);
      return { success: true };
    }
    return { success: false, error: "Peserta tidak ditemukan" };
  };

  const approveEvent = (eventId) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    updateEvent(eventId, { status: "approved" });

    // Notify Panitia
    addNotification({
      title: "Event Disetujui ✓",
      message: `Pengajuan event "${evt.nama}" Anda telah disetujui oleh PO dan sekarang aktif!`,
      email: evt.pengajuEmail,
      type: "success",
    });
  };

  const rejectEvent = (eventId, alasan) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    updateEvent(eventId, { status: "rejected", alasanDitolak: alasan });

    // Notify Panitia
    addNotification({
      title: "Event Ditolak ✗",
      message: `Pengajuan event "${evt.nama}" Anda ditolak. Alasan: "${alasan}".`,
      email: evt.pengajuEmail,
      type: "error",
    });
  };

  const setPresence = (eventId, nimOrEmail, isPresent, jam = null) => {
    let studentName = "";
    const updatedEvents = events.map((evt) => {
      if (evt.id === eventId) {
        const updatedPeserta = evt.peserta.map((p) => {
          if (p.nim === nimOrEmail || p.email === nimOrEmail) {
            studentName = p.nama;
            return {
              ...p,
              statusHadir: isPresent ? "hadir" : "tidak hadir",
              jamScan: isPresent ? (jam || new Date().toTimeString().split(" ")[0]) : null,
            };
          }
          return p;
        });
        return { ...evt, peserta: updatedPeserta };
      }
      return evt;
    });

    saveEvents(updatedEvents);
    return { success: true, studentName };
  };

  const requestCertificate = (eventId) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    updateEvent(eventId, { sertifikatStatus: "pending" });

    // Notify PO
    addNotification({
      title: "Pengajuan Sertifikat",
      message: `Sertifikat untuk event "${evt.nama}" telah diajukan oleh panitia.`,
      role: "po",
      type: "pending_approval",
    });
  };

  const approveCertificate = (eventId) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    updateEvent(eventId, { sertifikatStatus: "approved", eventStatus: "selesai" });

    // Notify Panitia
    addNotification({
      title: "Sertifikat Disetujui ✓",
      message: `Sertifikat untuk event "${evt.nama}" telah disetujui oleh PO dan aktif!`,
      email: evt.pengajuEmail,
      type: "success",
    });

    // Notify all present students
    evt.peserta.forEach((p) => {
      if (p.statusHadir === "hadir") {
        addNotification({
          title: "Sertifikat Tersedia 🎓",
          message: `Sertifikat keikutsertaan Anda di event "${evt.nama}" sudah siap diunduh!`,
          email: p.email,
          type: "success",
        });
      }
    });
  };

  const rejectCertificate = (eventId, alasan) => {
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    updateEvent(eventId, { sertifikatStatus: "rejected", alasanSertifikatDitolak: alasan });

    // Notify Panitia
    addNotification({
      title: "Sertifikat Ditolak ✗",
      message: `Sertifikat untuk "${evt.nama}" ditolak oleh PO. Alasan: "${alasan}".`,
      email: evt.pengajuEmail,
      type: "error",
    });
  };

  // Helper inside to push notifications
  const addNotification = (notif) => {
    const currentNotifications = getLocalStorageItem("notifications", []);
    const newNotif = {
      id: "NOTIF-" + Date.now() + Math.random().toString(36).substr(2, 4),
      title: notif.title,
      message: notif.message,
      read: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...notif, 
    };
    setLocalStorageItem("notifications", [newNotif, ...currentNotifications]);
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("notifications-updated"));
    }
  };

  return {
    events,
    addEvent,
    updateEvent,
    rsvpEvent,
    cancelRsvp,
    approveEvent,
    rejectEvent,
    setPresence,
    requestCertificate,
    approveCertificate,
    rejectCertificate,
  };
}
